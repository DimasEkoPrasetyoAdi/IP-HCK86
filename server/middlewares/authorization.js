function authorization(model) {
  return async (req, res, next) => {
    const { id } = req.params; 
    const userId = req.user ? req.user.id : null; 

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const resource = await model.findByPk(id); 
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      if (resource.UserId !== userId) {
        return res.status(403).json({ error: 'Forbidden: Access denied' });
      }

      next(); 
    } catch (err) {
      next(err); 
  };
}
}

module.exports = { authorization };
