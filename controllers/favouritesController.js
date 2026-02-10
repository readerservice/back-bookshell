const favouritesModel = require('../models/favouritesModel.js');
const validateBookPayload = require('../helper/index.js');

exports.getFavourites = async (req, res) => {
    try {
        const docs = await favouritesModel.find({ userId: req.user.id }).sort({ updatedAt: -1 }).lean()
        return res.json({ ok: true, count: docs.length, items: docs.map((d) => ({ id: d.bookId, ...d.book })) })
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'Failed to fetch favorites' })
    }
};

exports.createFavourites = async (req, res) => {
    const book = req.body
    const errMsg = validateBookPayload(book)
    if (errMsg) return res.status(400).json({ ok: false, error: errMsg })


    try {
        const doc = await favouritesModel.findOneAndUpdate(
            { userId: req.user.id, bookId: book.id },
            { $set: { book }, $setOnInsert: { userId: req.user.id, bookId: book.id } },
            { new: true, upsert: true }
        ).lean()


        const status = doc.createdAt && doc.updatedAt && doc.createdAt.getTime() === doc.updatedAt.getTime() ? 201 : 200
        return res.status(status).json({ ok: true, bookId: book.id, item: doc.book })
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(200).json({ ok: true, info: 'Already in favorites' })
        }
        return res.status(500).json({ ok: false, error: 'Failed to save favorite' })
    }
};

exports.deleteFavourites = async (req, res) => {
    try {
        const { id } = req.params
        const r = await favouritesModel.findOneAndDelete({ userId: req.user.id, bookId: id }).lean()
        if (!r) return res.status(404).json({ ok: false, error: 'Not found' })
        return res.json({ ok: true })
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'Failed to remove favorite' })
    }
};