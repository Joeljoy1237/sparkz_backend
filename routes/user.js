const express = require('express');
const router = express.Router();

//sample api
router.get('/test',(req,res)=>{
    res.json("Hey, Joel!")
})

module.exports = router;