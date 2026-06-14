import { Router } from 'express'
import { getChats, getMessages, postMessage } from '../controllers/chatController'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.use(authMiddleware)
router.get('/', getChats)
router.get('/:chatId/messages', getMessages)
router.post('/message', postMessage)

export default router
