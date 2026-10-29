import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../dao/userDao.js';
const roles = { admin: 'admin', recepcionista: 'receptionist', fisioterapeuta: 'therapist' };
export function createAuthController() {
 return {
  register: async (req,res,next) => { try { const nombre=String(req.body.nombre||'').trim(); const correo=String(req.body.correo||'').trim().toLowerCase(); const password=String(req.body.password||''); if(nombre.length<2 || !/^\S+@\S+\.\S+$/.test(correo) || password.length<8) return res.status(400).json({error:'Ingresa un nombre, correo válido y contraseña de al menos 8 caracteres.'}); const exists=await findUserByEmail(correo); if(exists) return res.status(409).json({error:'Ya existe una cuenta con ese correo.'}); const contrasena_hash=await bcrypt.hash(password,12); const user=await createUser({nombre,correo,contrasena_hash}); return res.status(201).json({message:'Cuenta creada. Ya puedes iniciar sesión.', user}); } catch(e){next(e)} },
  login: async (req,res,next) => { try { const correo=String(req.body.correo||'').trim().toLowerCase(); const password=String(req.body.password||''); const user=await findUserByEmail(correo); if(!user || !user.activo || !(await bcrypt.compare(password,user.contrasena_hash))) return res.status(401).json({error:'Correo o contraseña incorrectos.'}); if(!process.env.JWT_SECRET) return res.status(500).json({error:'Falta configurar JWT_SECRET en backend/.env.'}); const token=jwt.sign({sub:user.id,rol:user.rol},process.env.JWT_SECRET,{expiresIn:'8h'}); return res.json({token,user:{id:user.id,nombre:user.nombre,correo:user.correo,rol:user.rol,role:roles[user.rol]}}); } catch(e){next(e)} }
 };
}
