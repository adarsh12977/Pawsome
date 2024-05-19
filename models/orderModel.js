import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    entries: [
        {
            type: mongoose.ObjectId,
            ref: 'Entries'
        }
    ],
    payment: {},
    buyer: {
        type: mongoose.ObjectId,
        ref: 'users'
    },
    status: {
        type: String,
        default: 'Not Processed',
        enum: ['Not Processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    }
}, {timestamps: true})

export default mongoose.model('Order', orderSchema)