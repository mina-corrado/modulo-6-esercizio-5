const express = require('express');
const multer = require('multer');
const router = express.Router();

const Author = require('../models/Autore');
const cloudStorage = require('../middleware/cloudStorage');
const cloudMulter = multer({ storage: cloudStorage });

const sendMail = require('../middleware/email');

router.get('/authors', async (req, res, next) => {
    const {page = '1', size = '4'} = req.query;
    const result = await Author.find()
                .skip((Number(page)-1) * Number(size))
                .limit(Number(size));
    const count = await Author.count();
    return res.json({count, results: result});
});
router.get('/authors/:id', async (req, res) => {
    const {id} = req.params;
    let result;
    try {
        result = await Author.findById(id);
        return res.json(result);
    } catch (err) {
        next(err)
    }
});
router.patch('/authors/:id/avatar', cloudMulter.single('avatar'), async (req, res) => {
    const {id} = req.params;
    let result;
    try {
        if(req.file){
            const result = await Author.updateOne({_id: id},{ avatar: req.file.path});

            console.log(result);
        }
        result = await Author.findById(id);
        return res.json(result);
    } catch (err) {
        next(err)
    }
});
router.post('/authors', async (req, res, next) => {
    const body = req.body;
    const newAuthor = new Author({...body});
    try {
        const result = newAuthor.save();
        if(result && body.email){
            const msg = {
                to: newAuthor.email,
                subject: 'Registrazione avvenuta con successo',
                text: 'Grazie per esserti registrato',
                html: '<strong>Grazie per esserti registrato</strong>',
            };
            await sendMail(msg);
        }
        return res.status(201).json({result});            
    } catch (err) {
        next(err);
    }
});
router.put('/authors/:id', async (req, res, next) => {
    const {id} = req.params;
    const body = req.body;
    try {
        const author = await Author.findById(id);
        console.log("author=> ",author);
        const result = await Author.updateOne({_id: author._id},{...body});
        console.log('modified ', result.modifiedCount)
        return res.json(result);
    } catch (err) {
        next(err)
    }
});
router.delete('/authors/:id', async (req, res, next) => {
    const {id} = req.params;
    try {
        const author = await Author.findByIdAndDelete(id);
        return res.json(author);
    } catch (err) {
        next(err)
    }
});

module.exports = router;