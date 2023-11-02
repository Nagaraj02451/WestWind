import {v2 as cloudinary} from "cloudinary"



cloudinary.config({
    cloud_name : process.env.CN,
    api_key : process.env.ApiCN,
    api_secret : process.env.ApiCNSEC
})