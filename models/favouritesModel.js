const mongoose = require('mongoose');

const IdentifierSchema = new mongoose.Schema(
    {
        type: { type: String, default: null },
        identifier: { type: String, default: null },
    },
    { _id: false }
)

const ImageSchema = new mongoose.Schema(
    {
        thumbnail: { type: String, default: null },
    },
    { _id: false }
)

const BookInfoSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        authors: { type: [String], default: [] },
        publisher: { type: String, default: null },
        publishedDate: { type: String, default: null },
        pageCount: { type: Number, default: null },
        industryIdentifiers: { type: [IdentifierSchema], default: [] },
        categories: { type: [String], default: [] },
        imageLinks: { type: ImageSchema, default: null },
        description: { type: String, default: null },
    },
    { _id: false }
)


const FavoriteSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, index: true },
        bookId: { type: String, required: true },
        book: { type: BookInfoSchema, required: true },
    },
    { timestamps: true }
)


FavoriteSchema.index({ userId: 1, bookId: 1 }, { unique: true })

module.exports = mongoose.model('favourites', FavoriteSchema)