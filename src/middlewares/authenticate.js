// TODO: implementar verificación JWT
// Por ahora inyecta un usuario de prueba para poder probar el flujo completo
export const authenticate = (req, res, next) => {
  req.user = { id: 2, email: 'test@test.com' };
  next();
};
