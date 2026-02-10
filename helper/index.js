module.exports = function validateBookPayload(book) {
    if (!book || typeof book !== 'object' || Array.isArray(book)) return 'Body must be a JSON object'
    if (!book.title) return 'Field "title" is required'
    return null
}