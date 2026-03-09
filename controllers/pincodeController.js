export const checkPincode = async (req,res) => {

 try{

  const { pincode } = req.body;

  const token = await getNimbusToken();

  const response = await axios.get(
   `https://ship.nimbuspost.com/api/v1/courier/serviceability`,
   {
    params:{
     pickup_postcode:process.env.PICKUP_PINCODE,
     delivery_postcode:pincode,
     cod:0,
     weight:0.5
    },
    headers:{
     Authorization:`Bearer ${token}`
    }
   }
  );

  res.json({
   success:true,
   data:response.data
  });

 }catch(err){

  console.log("PINCODE ERROR:",err.response?.data || err.message);

  res.status(500).json({
   success:false,
   message:"Server error"
  });

 }

};