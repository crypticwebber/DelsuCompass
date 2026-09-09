import { connectDatabase,disconnectDatabase } from "../config/database.js";
import { InformationNoticeModel } from "../modules/information/information-notice.model.js";
import { GuideArticleModel } from "../modules/information/guide-article.model.js";
import { CommunityPostModel } from "../modules/community/community.model.js";
import { EventModel } from "../modules/events/event.model.js";
import { OpportunityModel } from "../modules/opportunities/opportunity.model.js";
import { AccommodationModel } from "../modules/accommodation/accommodation.model.js";
import { SafetyAlertModel } from "../modules/safety/safety-alert.model.js";
import { SafetyReportModel } from "../modules/safety/safety-report.model.js";
import { LocationModel } from "../modules/locations/location.model.js";
async function run(){await connectDatabase();const q={title:/^\[DEMO\] /};await Promise.all([InformationNoticeModel.deleteMany(q),GuideArticleModel.deleteMany(q),CommunityPostModel.deleteMany(q),EventModel.deleteMany(q),OpportunityModel.deleteMany(q),AccommodationModel.deleteMany(q),SafetyAlertModel.deleteMany(q),SafetyReportModel.deleteMany({description:/^\[DEMO\] /}),LocationModel.deleteMany({name:/^\[DEMO\] /})]);console.log("Demo content removed. Normal users and non-demo data were not deleted.");await disconnectDatabase()}
run().catch(async e=>{console.error(e);await disconnectDatabase().catch(()=>undefined);process.exit(1)});
