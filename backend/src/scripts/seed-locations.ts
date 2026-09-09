import { connectDatabase,disconnectDatabase } from "../config/database.js";
import { LocationModel } from "../modules/locations/location.model.js";

const rows=[
 {name:"Abraka Town Centre",description:"Reference centre point for Abraka town used to initialise the Compass Map.",category:"landmark",area:"Abraka",latitude:5.7836,longitude:6.1005,address:"Abraka, Delta State, Nigeria",isActive:true,isVerified:true,sourceLabel:"OpenStreetMap / Mapcarta reference"},
 {name:"DELSU Site III (reference point)",description:"Published reference coordinate within Delta State University Abraka Site III. Administrators should add individual buildings by clicking their exact positions on the map.",category:"academic",area:"Abraka",campusSite:"Site III",latitude:5.79,longitude:6.104722,address:"Delta State University, Abraka",isActive:true,isVerified:true,sourceLabel:"Published DELSU Abraka Site III research coordinate"},
] as const;
async function run(){await connectDatabase();for(const row of rows)await LocationModel.findOneAndUpdate({name:row.name},{...row},{upsert:true,new:true,setDefaultsOnInsert:true});console.log(`Seeded ${rows.length} verified map reference locations.`);await disconnectDatabase()}
run().catch(async e=>{console.error(e);await disconnectDatabase().catch(()=>undefined);process.exit(1)});
