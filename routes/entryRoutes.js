import express from 'express'
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js'
import { braintreePaymentController, braintreeTokenController, createEntryController, deleteEntryController, entryCategoryController, entryCountController, entryFiltersController, entryListController, entryPhotoController, getEntryController, getSingleEntryController, relatedEntryController, searchEntryController, updateEntryController } from '../controllers/entryController.js'
import formidable from 'express-formidable'

const router = express.Router()

router.post('/create-entry', requireSignIn, isAdmin, formidable(), createEntryController)
router.put('/update-entry/:pid', requireSignIn, isAdmin, formidable(), updateEntryController)
router.get('/get-entry', getEntryController)
router.get('/get-entry/:slug', getSingleEntryController)
router.get('/entry-photo/:pid', entryPhotoController)
router.delete('/delete-entry/:pid', deleteEntryController)
router.post('/entry-filters', entryFiltersController)
router.get('/entry-count', entryCountController)
router.get('/entry-list/:page', entryListController)
router.get('/search/:keyword', searchEntryController)
router.get('/related-entry/:pid/:cid', relatedEntryController)
router.get('/entry-category/:slug', entryCategoryController)
router.get('/braintree/token', braintreeTokenController)
router.post('/braintree/payment', requireSignIn, braintreePaymentController)

export default router