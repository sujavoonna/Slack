"use strict";

exports.handle = (req, res) => {
    console.log('request'+req.body);
    res.json({text: "Go it"}); 
}
