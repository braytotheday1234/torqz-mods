export const CATEGORIES = Object.freeze(["All","Vehicles","Parts","Performance","Visual","Utility"]);
export const PROJECT_STATUSES=Object.freeze(["Concept","In Development","Testing","Release Candidate","Released","Archived"]);
export const MODS=Object.freeze([{
id:"project-01",slug:"project-01",title:"Project 01",subtitle:"First Torqz development project",
shortDescription:"The first official Torqz Mods BeamNG.drive project, currently in active development.",
description:"Project 01 is the first Torqz Mods release in development. Its final name, verified specifications, real in-game screenshots, supported BeamNG.drive version, file size, and release package will be published only when they are real.",
category:"Vehicles",status:"In Development",currentPhase:"Foundation",version:"TBD",beamngVersion:"TBD",fileSize:"TBD",releaseDate:"",updatedAt:"2026-10-06",updatedLabel:"In development",featured:true,downloadUrl:"",
heroImage:"assets/projects/project-01/hero.svg",thumbnail:"assets/projects/project-01/thumb.svg",video:"",videoPoster:"",
gallery:[
{src:"assets/projects/project-01/gallery-01.svg",type:"image",alt:"Project 01 development media placeholder",caption:"Development media placeholder"},
{src:"assets/projects/project-01/gallery-02.svg",type:"image",alt:"Project 01 development media placeholder",caption:"Development media placeholder"},
{src:"assets/projects/project-01/gallery-03.svg",type:"image",alt:"Project 01 development media placeholder",caption:"Development media placeholder"}],
features:[
{title:"Original Torqz project",description:"Built as a first-party Torqz Mods release rather than a re-upload or repack."},
{title:"Clear release information",description:"Compatibility, file size, version, and installation notes will be published only after verification."},
{title:"Support-ready",description:"Installation help, known issues, and release notes are organized around the project page."}],
installation:[
{title:"Download",description:"Use the official Torqz release link once Project 01 is published."},
{title:"Keep the ZIP intact",description:"Keep the archive zipped unless the project release notes say otherwise."},
{title:"Place in Mods",description:"Move the ZIP into the mods folder inside your active BeamNG.drive user folder."},
{title:"Launch BeamNG",description:"Start the game and verify the project appears before deeper troubleshooting."}],
compatibility:{status:"Testing",beamngVersion:"TBD",knownIssues:"None published yet"},
developmentMilestones:[
{name:"Foundation",status:"Complete"},
{name:"Vehicle Data",status:"In Progress"},
{name:"Damage System",status:"Planned"},
{name:"Effects",status:"Planned"},
{name:"Testing",status:"Planned"},
{name:"Release",status:"Planned"}],
developmentLog:[{date:"2026-10-06",displayDate:"OCT 06 2026",title:"Project foundation created",description:"Project 01 structure and first development foundation are in place.",status:"Complete",media:""}],
changelog:[{version:"Development",date:"",groups:{Added:["Professional release page structure","Project media placeholders ready for real screenshots"],Changed:["Project data model expanded for future releases"],Fixed:[]}}],
credits:["Torqz Mods"]
}]);
export function getModBySlug(slug){return MODS.find(m=>m.slug===slug)||null;}