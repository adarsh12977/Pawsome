import entryModel from "../models/entryModel.js"
import categoryModel from '../models/categoryModel.js'
import orderModel from "../models/orderModel.js";
import fs from 'fs';
import slugify from 'slugify';
import braintree from "braintree";
import dotenv from 'dotenv'

dotenv.config()

var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: '7dad55f8dbe2193907c534b15d46d41e',
})

export const createEntryController = async (req,res) => {
    try {
        const {name,slug,description,price,category,quantity,shipping} = req.fields
        const {photo} = req.files
        switch(true){
            case !name:
                return res.status(500).send({error: 'Name is required'})
            case !description:
                return res.status(500).send({error: 'Description is required'})
            case !price:
                return res.status(500).send({error: 'Price is required'})
            case !category:
                return res.status(500).send({error: 'Category is required'})
            case !quantity:
                return res.status(500).send({error: 'Quantity is required'})
            case photo && photo.size>1000000:
                    return res.status(500).send({error: 'Photo is required and size should be less than 1MB'})
        }
        const entries = new entryModel({...req.fields, slug:slugify(name)})
        if(photo){
            entries.photo.data = fs.readFileSync(photo.path)
            entries.photo.contentType = photo.type
        }
        await entries.save()
        res.status(201).send({
            success: true,
            message: 'New entry created',
            entries
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in creating entry',
            error
        })
    }
}

export const getEntryController = async (req,res) => {
    try {
        const entries = await entryModel.find({}).populate('category').select('-photo').limit(12).sort({createdAt:-1})
        res.status(200).send({
            success: true,
            countTotal: entries.length,
            message: 'All entries got successfully',
            entries,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error while getting entries',
            error
        })
    }
}

export const getSingleEntryController = async (req,res) => {
    try {
        const entry = await entryModel.findOne({slug:req.params.slug}).select('-photo').populate('category')
        res.status(200).send({
            success: true,
            message: 'Single entry fetched successfully',
            entry
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error while getting single entry',
            error
        })
    }
}

export const entryPhotoController = async (req,res) => {
    try {
        const entry = await entryModel.findById(req.params.pid).select('photo')
        if(entry.photo.data){
            res.set('Content-type', entry.photo.contentType)
            return res.status(200).send(entry.photo.data)
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in getting photo',
            error
        })
    }
}

export const deleteEntryController = async (req,res) => {
    try {
        await entryModel.findByIdAndDelete(req.params.pid).select('-photo')
        res.status(200).send({
            success: true,
            message: 'Entry deleted successfully'
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error while deleting entry',
            error
        })
    }
}

export const updateEntryController = async (req,res) => {
    try {
        const {name,slug,description,price,category,quantity,shipping} = req.fields
        const {photo} = req.files
        switch(true){
            case !name:
                return res.status(500).send({error: 'Name is required'})
            case !description:
                return res.status(500).send({error: 'Description is required'})
            case !price:
                return res.status(500).send({error: 'Price is required'})
            case !category:
                return res.status(500).send({error: 'Category is required'})
            case !quantity:
                return res.status(500).send({error: 'Quantity is required'})
            case photo && photo.size>1000000:
                    return res.status(500).send({error: 'Photo is required and size should be less than 1MB'})
        }
        const entries = await entryModel.findByIdAndUpdate(req.params.pid,{...req.fields, slug:slugify(name)}, {new:true})
        if(photo){
            entries.photo.data = fs.readFileSync(photo.path)
            entries.photo.contentType = photo.type
        }
        await entries.save()
        res.status(201).send({
            success: true,
            message: 'Entry updated successfully',
            entries
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in updating entry',
            error
        })
    }
}

export const entryFiltersController = async (req,res) => {
    try {
        const {checked, radio} = req.body
        let args = {}
        if(checked.length>0){
            args.category = checked
        }
        if(radio.length){
            args.price = {$gte:radio[0], $lte:radio[1]}
        }
        const entries = await entryModel.find(args)
        res.status(200).send({
            success: true,
            entries
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error while filtering entries',
            error
        })
    }
}

export const entryCountController = async (req,res) => {
    try {
        const total = await entryModel.find({}).estimatedDocumentCount()
        res.status(200).send({
            success: true,
            total
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error in entry count',
            error
        })
    }
}

export const entryListController = async (req,res) => {
    try {
        const perPage = 6;
        const page = req.params.page ? req.params.page : 1
        const entries = await entryModel.find({}).select('-photo').skip((page-1)*perPage).limit(perPage).sort({createdAt:-1})
        res.status(200).send({
            success: true,
            entries
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error in per page controller',
            error
        })
    }
}

export const searchEntryController = async (req,res) => {
    try {
        const {keyword} = req.params
        const results = await entryModel.find({
            $or:[
                {name:{$regex:keyword, $options:'i'}}
            ]
        }).select('-photo')
        res.json(results)
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error in search entry callback',
            error
        })
    }
}

export const relatedEntryController = async (req,res) => {
    try {
        const {pid, cid} = req.params
        const entries = await entryModel.find({category:cid, _id:{$ne:pid}}).select('-photo').limit(3).populate('category')
        res.status(200).send({
            success: true,
            entries
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error while getting related entries',
            error
        })
    }
}

export const entryCategoryController = async (req,res) => {
    try {
        const category = await categoryModel.findOne({slug:req.params.slug})
        const entries = await entryModel.find({category}).populate('category')
        res.status(200).send({
            success: true,
            category,
            entries
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error while getting entries',
            error
        })
    }
}

export const braintreeTokenController = async (req,res) => {
    try {
        gateway.clientToken.generate({}, function(err,response){
            if(err){
                res.status(500).send(err)
            }
            else{
                res.send(response)
            }
        })
    } catch (error) {
        console.log(error)
    }
}

export const braintreePaymentController = async (req,res) => {
    try {
        const {nonce,cart} = req.body
        let total = 0
        cart.map((i)=>{
            total += i.price;
        })
        let newTransaction = gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options:{
                submitForSettlement: true
            }
        },
        function(error, result){
            if(result){
                const order = new orderModel({
                    entries: cart,
                    payment: result,
                    buyer: req.user._id
                }).save()
                res.json({ok:true})
            }
            else{
                res.status(500).send(error)
            }
        }
    )
    } catch (error) {
        console.log(error)
    }
}