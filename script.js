// =========================
// FIREBASE CONFIG
// =========================

const firebaseConfig = {
    apiKey: "AIzaSyBbtmrXEEJjr415CvKCfP6DDixOLw44rrk",
    authDomain: "campus-gaurdian.firebaseapp.com",
    projectId: "campus-gaurdian",
    storageBucket: "campus-gaurdian.firebasestorage.app",
    messagingSenderId: "343830637884",
    appId: "1:343830637884:web:678f9c05bd5e383f974239",
    measurementId: "G-HL5WCC4JRT"
};


// =========================
// FIREBASE INITIALIZATION
// =========================

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();


// =========================
// REPORTS
// =========================

let reports = [];


// =========================
// SHOW PAGE
// =========================

function showPage(pageName) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageName);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    window.scrollTo(0, 0);

    if (pageName === "reports") {
        displayReports();
    }

    if (pageName === "dashboard") {
        updateDashboard();
    }
}


// =========================
// LOAD REPORTS FROM FIRESTORE
// =========================

function loadReports() {

    db.collection("reports")
        .orderBy("createdAt", "desc")
        .onSnapshot(snapshot => {

            reports = [];

            snapshot.forEach(doc => {

                reports.push({
                    id: doc.id,
                    ...doc.data()
                });

            });

            console.log("Reports loaded from Firestore:", reports);

            displayReports();
            updateDashboard();

        }, error => {

            console.error("Error loading reports:", error);

        });

}


// =========================
// REPORT FORM
// =========================

document.addEventListener("DOMContentLoaded", function () {

    const reportForm =
        document.getElementById("reportForm");

    if (!reportForm) {

        console.error("Report form not found!");

        return;

    }


    reportForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const category =
            document.getElementById("category").value;

        const location =
            document.getElementById("location").value;

        const description =
            document.getElementById("description").value;

        const priority =
            document.getElementById("priority").value;


        const newReport = {

            category: category,

            location: location,

            description: description,

            priority: priority,

            status: "Pending",

            date: new Date().toLocaleDateString(),

            createdAt:
                firebase.firestore.FieldValue.serverTimestamp()

        };


        try {

            console.log("Submitting report:", newReport);


            await db.collection("reports").add(newReport);


            console.log("Report successfully added to Firestore");


            alert("Report submitted successfully!");


            reportForm.reset();


            showPage("reports");


        }

        catch (error) {

            console.error(
                "Error submitting report:",
                error
            );


            alert(
                "Could not submit the report. Please try again."
            );

        }

    });

});


// =========================
// DISPLAY REPORTS
// =========================

function displayReports() {

    const list =
        document.getElementById("reportList");

    if (!list) {

        return;

    }


    const searchInput =
        document.getElementById("searchInput");

    const statusFilter =
        document.getElementById("statusFilter");

    const priorityFilter =
        document.getElementById("priorityFilter");


    const search =
        searchInput
            ? searchInput.value.toLowerCase()
            : "";


    const status =
        statusFilter
            ? statusFilter.value
            : "All";


    const priority =
        priorityFilter
            ? priorityFilter.value
            : "All";


    let filteredReports =
        reports.filter(report => {

            const matchesSearch =

                (report.category || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (report.location || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (report.description || "")
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =
                status === "All"
                ||
                report.status === status;


            const matchesPriority =
                priority === "All"
                ||
                report.priority === priority;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority
            );

        });


    if (filteredReports.length === 0) {

        list.innerHTML = `

            <div class="empty">

                <h3>
                    No reports found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        `;

        return;

    }


    list.innerHTML = "";


    filteredReports.forEach(report => {

        const card =
            document.createElement("div");


        card.className =
            "report-card";


        card.innerHTML = `

            <div class="report-info">

                <h3>
                    ${report.category || "Unknown"}
                </h3>

                <p>
                    📍 ${report.location || "Unknown"}
                </p>

                <p>
                    ${report.description || ""}
                </p>

                <p>
                    Reported:
                    ${report.date || ""}
                </p>

                <div class="report-meta">

                    <span class="tag ${getPriorityClass(report.priority)}">
                        ${report.priority || "Low"} Priority
                    </span>

                    <span class="tag ${getStatusClass(report.status)}">
                        ${report.status || "Pending"}
                    </span>

                </div>

            </div>


            <div>

                <button
                    class="primary-btn"
                    onclick="changeStatus('${report.id}')">

                    Update Status

                </button>


                <button
                    class="delete-btn"
                    onclick="deleteReport('${report.id}')">

                    Delete

                </button>

            </div>

        `;


        list.appendChild(card);

    });

}


// =========================
// PRIORITY CLASS
// =========================

function getPriorityClass(priority) {

    if (priority === "High") {

        return "high";

    }

    if (priority === "Medium") {

        return "medium";

    }

    return "low";

}


// =========================
// STATUS CLASS
// =========================

function getStatusClass(status) {

    if (status === "Resolved") {

        return "resolved";

    }

    if (status === "In Progress") {

        return "inprogress";

    }

    return "pending";

}


// =========================
// CHANGE STATUS
// =========================

async function changeStatus(id) {

    const report =
        reports.find(
            item => item.id === id
        );


    if (!report) {

        return;

    }


    let newStatus;


    if (report.status === "Pending") {

        newStatus = "In Progress";

    }

    else if (report.status === "In Progress") {

        newStatus = "Resolved";

    }

    else {

        newStatus = "Pending";

    }


    try {

        await db.collection("reports")
            .doc(id)
            .update({

                status: newStatus

            });

    }

    catch (error) {

        console.error(
            "Error updating status:",
            error
        );


        alert(
            "Could not update the report."
        );

    }

}


// =========================
// DELETE REPORT
// =========================

async function deleteReport(id) {

    const report =
        reports.find(
            item => item.id === id
        );


    if (!report) {

        return;

    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this report?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        await db.collection("reports")
            .doc(id)
            .delete();

    }

    catch (error) {

        console.error(
            "Error deleting report:",
            error
        );


        alert(
            "Could not delete the report."
        );

    }

}


// =========================
// DASHBOARD
// =========================

function updateDashboard() {

    const totalElement =
        document.getElementById("totalReports");

    const pendingElement =
        document.getElementById("pendingReports");

    const highElement =
        document.getElementById("highReports");

    const resolvedElement =
        document.getElementById("resolvedReports");

    const healthElement =
        document.getElementById("healthScore");


    if (!totalElement) {

        return;

    }


    const total =
        reports.length;


    const pending =
        reports.filter(
            r => r.status === "Pending"
        ).length;


    const high =
        reports.filter(
            r =>
                r.priority === "High" &&
                r.status !== "Resolved"
        ).length;


    const resolved =
        reports.filter(
            r => r.status === "Resolved"
        ).length;


    totalElement.textContent =
        total;


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }


    if (highElement) {

        highElement.textContent =
            high;

    }


    if (resolvedElement) {

        resolvedElement.textContent =
            resolved;

    }


    let score = 100;


    reports.forEach(report => {

        if (report.status !== "Resolved") {

            if (report.priority === "High") {

                score -= 10;

            }

            else if (report.priority === "Medium") {

                score -= 5;

            }

            else {

                score -= 2;

            }

        }

    });


    score =
        Math.max(0, score);


    if (healthElement) {

        healthElement.textContent =
            score + "%";

    }

}


// =========================
// START FIRESTORE LISTENER
// =========================

document.addEventListener("DOMContentLoaded", function () {

    loadReports();

    displayReports();

    updateDashboard();

});