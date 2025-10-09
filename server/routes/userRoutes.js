import express from "express"
import { verifyRoles, verifyToken } from "../middleware/AuthMiddleware.js";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser, updateUserStatus } from "../controllers/userController.js";
import { uploadUserAvatar } from "../config/multer.js";
const userRouter = express.Router();


userRouter.get('/', verifyToken, verifyRoles('admin'), getAllUsers);
userRouter.post('/', verifyToken, verifyRoles('admin'), uploadUserAvatar, createUser);
userRouter.put('/:id', verifyToken, verifyRoles('admin'), uploadUserAvatar, updateUser);
userRouter.get('/:id', verifyToken, verifyRoles('admin'), getUserById);
userRouter.delete('/:id', verifyToken, verifyRoles('admin'), deleteUser);
userRouter.patch('/:id/status', verifyToken, verifyRoles('admin'), updateUserStatus);



export default userRouter;