export const adminAuth = async (req,res,next)=> {
    try{
        if(req.user.isAdmin){
            res.status(200).json({message:"admin loged in successfully"})
        }
        else{
            res.status(403).json({message:"only acces for admins"})
        }
        
    }
    catch(error){
        next(error)
    }
}

export const adminProfile = async (req, res, next) => {
    try {
        // Obtener la información del perfil del administrador desde req.user
        const { _id, name, email, isAdmin, createdAt } = req.user;
        
        // Devolver la información del perfil (sin datos sensibles)
        res.status(200).json({
            success: true,
            user: {
                id: _id,
                name,
                email,
                isAdmin,
                memberSince: createdAt
            }
        });
    } catch (error) {
        next(error);
    }
}

