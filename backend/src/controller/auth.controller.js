export async function checkAuth(req,res,next){
    if(!req.user){
            res.status(401).json({message:"User Unautherized"});
            return;
        }
    res.status(200).json(req.user)
}
