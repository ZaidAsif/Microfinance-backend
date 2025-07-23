








const authenticateAdmin = async (req, res, next) => {
    try {
        if (!req.user || req.user.isAdmin !== true) {
            return res.status(403).json({ error: true, msg: 'Access Denied. Admins only.' });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, msg: 'Internal Server Error' });
    }
};

export default authenticateAdmin