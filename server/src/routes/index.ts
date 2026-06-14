import { Router } from 'express'
import auth from './auth'
import chat from './chat'

const router = Router()
router.use('/auth', auth)
router.use('/chats', chat)

export default router
