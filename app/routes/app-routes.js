const express=require('express');
const moment=require('moment');
const _=require('underscore');
const uuidv4=require('uuid/v4');

const router=express.Router();

const AWS=require('aws-sdk');
AWS.config.update({ region: 'us-east-1' })

const docClient=new AWS.DynamoDB.DocumentClient(); 
const tableName='td_notes_test';
// ejemplo

let user_id='1'
// endpoint para crear nota
router.post('/crear/nota', (req, res, next)=>{

    let item=req.body.Item;
    item.user_id=user_id;
    item.note_id= uuidv4();
    item.timestamp=moment().unix();
    item.expires=moment().add(90, 'days').unix();

    // agrega a la base de datos
    docClient.put({
        TableName:tableName,
        Item:item
    },(err, data)=>{
        if(err){
            console.log(err);
            return res.status(err.statusCode).send({
                message: err.message,
                status: err.statusCode
            })
        }else{
            console.log('se agrego correctamente')
            return res.status(200).send(item)
        }
    })
});
// endpoint para actualizar nota
router.patch('/actualizar/nota/:user_id', (req, res, next)=>{
    let user_id=req.params.user_id;
    let item=req.body.Item;
    item.user_id=user_id;

    item.expires=moment().add(90, 'days').unix();

    // agrega a la base de datos
    docClient.put({
        TableName:tableName,
        Item:item,
        ConditionExpression: '#t = :t',
        ExpressionAttributeNames: {
            '#t':'timestamp'
        },
        ExpressionAttributeValues: {
            ':t':item.timestamp
        }
    },(err, data)=>{
        if(err){
            console.log(err);
            return res.status(err.statusCode).send({
                message: err.message,
                status: err.statusCode
            })
        }else{
            console.log('se actualizo correctamente correctamente')
            console.log(data)
            return res.status(200).send(item)
        }
    })
});

// metodo get
router.get('/notas', (req, res, next)=>{
    // limite de notas
    let limit=req.query.limiit ? parseInt(req.query.limiit) : 5;
    let params={
        TableName:tableName,
        KeyConditionExpression: "user_id = :uid",
        ExpressionAttributeValues: {
            ":uid":user_id,
        },
        Limit:limit,
        ScanIndexForward: false
    };
    // starttimestamp es para colocar en la url parte de la pagina cion
    let starttimestamp=req.query.start ? parseInt(req.query.start) : 0;
    if(starttimestamp>0){
        params.ExclusiveStartKey={
            user_id:user_id,
            timestamp: starttimestamp
        }
    }
    // base de datos
    docClient.query(params, (err, data)=>{
        if(err){
            console.log(err);
            return res.status(err.statusCode).send({
                message: err.message,
                status: err.statusCode
            })
        }else{
            return res.status(200).send(data)
        }
    })
})

// obtener nota por la nota_id
router.get('/nota/:timestamp/:user_id', (req, res, next)=>{
    let timestamp=parseInt(req.params.timestamp);
    let user_id=req.params.user_id;
    let params={
        TableName:tableName,
        IndexName:'note_id-index',
        ExpressionAttributeNames: {
            '#timestamp':'timestamp',
            '#user_id':'user_id',
        },
        KeyConditionExpression: "#timestamp = :timestamp and #user_id = :user_id",
        ExpressionAttributeValues: {
            ":user_id":user_id,
            ":timestamp":timestamp,
        },
        Limit:1
    };

    docClient.query(params, (err, data)=>{
        if(err){
            console.log(err);
            return res.status(err.statusCode).send({
                message:err.message,
                status: err.statusCode
            })
        }else{
            if(!_.isEmpty(data.Items)){
                return res.status(200).send(data.Items[0])
            }else{
                return res.status(400).send()
            }
        }
    })
})

router.delete('/borrarnota/:timestamp/:user_id',(req,res,next)=>{
    let timestamp=parseInt(req.params.timestamp);
    let user_id=req.params.user_id;
    let params={
        TableName: tableName,
        Key:{
            user_id:user_id,
            timestamp: timestamp
        }
    };
    docClient.delete(params, (err,data)=>{
        if(err){
            console.log(err);
            return res.status(err.statusCode).send({
                message: err.message,
                status: err.statusCode
            })
        }else{
            return res.status(200).send()
        }
    })
})
module.exports=router;