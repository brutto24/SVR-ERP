
import { getFacultyTimetable } from "./src/actions/timetable";

async function main() {
    const facultyId = "ab7098b4-be8a-48a4-a070-d58d88714d3b"; // ID from previous check
    console.log("Testing getFacultyTimetable for:", facultyId);

    // This will trigger the console.logs I added to the action
    const timetable = await getFacultyTimetable(facultyId);

    timetable.forEach(t => {
        console.log(`Entry: Day=${t.dayOfWeek}, Period=${t.period}, Subject=${t.subjectName} (${t.subjectId}), Class=${t.className}`);
    });
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
