const express=require('express');
const moment=require('moment');
const _=require('underscore');
const uuidv4=require('uuid/v4');

const router=express.Router();

const AWS=require('aws-sdk');
AWS.config.update({ region: 'us-east-1' })

const docClient=new AWS.DynamoDB.DocumentClient(); 
const tableName='prueba_table1';
// ejemplo
var user_id='1';
var user_name=' Usuario nuevo';

// endpoint para crear nota
router.post('/crear/nota', (req, res, next)=>{

    let item=req.body.Item;
    item.user_id=user_id;
    item.user_name=user_name;
    item.note_id=user_id +':'+ uuidv4();
    item.time=moment().unix();
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
router.patch('/actualizar/nota', (req, res, next)=>{

    let item=req.body.Item;
    item.user_id=user_id;
    item.user_name=user_name;

    item.expires=moment().add(90, 'days').unix();

    // agrega a la base de datos
    docClient.put({
        TableName:tableName,
        Item:item,
        ConditionExpression: '#t = :t',
        ExpressionAttributeNames: {
            '#t':'time'
        },
        ExpressionAttributeValues: {
            ':t':item.time
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


module.exports=router;