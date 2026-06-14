import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'

export function authMiddleware(req: Request & { userId?: string }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ message: 'Missing token' })
  const token = auth.split(' ')[1]
  try {
    const payload: any = jwt.verify(token, config.jwtSecret)
    req.userId = payload.id
    next()
  } catch (err) { res.status(401).json({ message: 'Invalid token' }) }
}
