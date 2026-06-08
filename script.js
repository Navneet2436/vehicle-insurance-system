// ===============================
// ADD INSURANCE FORM
// ===============================

const form = document.getElementById("insuranceForm");

if (form) {

    const editIndex = localStorage.getItem("editIndex");
    const isEditMode = editIndex !== null;

    if (isEditMode) {

        const insuranceRecords =
            JSON.parse(localStorage.getItem("insuranceRecords")) || [];

        const record = insuranceRecords[Number(editIndex)];

        if (record) {
            document.getElementById("ownerName").value = record.ownerName;
            document.getElementById("vehicleNumber").value = record.vehicleNumber;
            document.getElementById("vehicleType").value = record.vehicleType;
            document.getElementById("insuranceProvider").value = record.insuranceProvider;
            document.getElementById("startDate").value = record.startDate;
            document.getElementById("expiryDate").value = record.expiryDate;
            document.getElementById("premiumAmount").value = record.premiumAmount;
        }
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const ownerName =
            document.getElementById("ownerName").value.trim();

        if (!/^[A-Za-z ]+$/.test(ownerName)) {
            alert("Owner Name should contain alphabets only!");
            return;
        }

        const insuranceData = {
            ownerName: ownerName,
            vehicleNumber: document.getElementById("vehicleNumber").value,
            vehicleType: document.getElementById("vehicleType").value,
            insuranceProvider: document.getElementById("insuranceProvider").value,
            startDate: document.getElementById("startDate").value,
            expiryDate: document.getElementById("expiryDate").value,
            premiumAmount: document.getElementById("premiumAmount").value
        };

        let insuranceRecords =
            JSON.parse(localStorage.getItem("insuranceRecords")) || [];

        if (isEditMode) {

            // -----------------------------------------------
            // PRIMARY KEY CHECK (EDIT MODE)
            // If vehicle number was changed, make sure the
            // new one doesn't already belong to another record
            // -----------------------------------------------
            const isDuplicate = insuranceRecords.some(
                (r, i) => r.vehicleNumber === insuranceData.vehicleNumber && i !== Number(editIndex)
            );
            if (isDuplicate) {
                alert("Vehicle Number already exists! Choose a different one.");
                return;
            }

            insuranceRecords[Number(editIndex)] = insuranceData;
            localStorage.removeItem("editIndex");
            alert("Record updated successfully!");

        } else {

            // -----------------------------------------------
            // PRIMARY KEY CHECK (ADD MODE)
            // Vehicle number must be unique across all records
            // -----------------------------------------------
            const isDuplicate = insuranceRecords.some(
                r => r.vehicleNumber === insuranceData.vehicleNumber
            );
            if (isDuplicate) {
                alert("Vehicle Number already exists! It must be unique.");
                return;
            }

            insuranceRecords.push(insuranceData);
            alert("Insurance added successfully!");
        }

        localStorage.setItem(
            "insuranceRecords",
            JSON.stringify(insuranceRecords)
        );

        window.location.href = "records.html";
    });
}


// ===============================
// GLOBAL DATA FUNCTION
// ===============================

function getRecords() {
    return JSON.parse(localStorage.getItem("insuranceRecords")) || [];
}


// ===============================
// SHOW RECORDS + SEARCH + ANALYTICS
// ===============================

const recordsBody = document.getElementById("recordsBody");
const searchInput = document.getElementById("searchInput");

function displayRecords(records) {

    if (!recordsBody) return;

    recordsBody.innerHTML = "";

    let total = records.length;
    let active = 0;
    let due = 0;
    let expired = 0;

    const today = new Date();

    records.forEach((record, index) => {

        const expiryDate = new Date(record.expiryDate);
        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        let status = "Active";

        if (daysLeft < 0) {
            status = "Expired";
            expired++;
        }
        else if (daysLeft <= 30) {
            status = "Renewal Due";
            due++;
        }
        else {
            active++;
        }

        recordsBody.innerHTML += `
            <tr>
                <td>${record.ownerName}</td>
                <td>${record.vehicleNumber.toUpperCase()}</td>
                <td>${record.vehicleType}</td>
                <td>${record.insuranceProvider.toUpperCase()}</td>
                <td>${record.startDate}</td>
                <td>${record.expiryDate}</td>
                <td>${record.premiumAmount}</td>
                <td>${status}</td>
                <td>
                    <button onclick="editRecord(${index})">Edit</button>
                    <button onclick="deleteRecord(${index})">Delete</button>
                </td>
            </tr>
        `;
    });

    // Update cards safely
    const totalEl = document.getElementById("totalCount");
    const activeEl = document.getElementById("activeCount");
    const dueEl = document.getElementById("dueCount");
    const expiredEl = document.getElementById("expiredCount");

    if (totalEl) totalEl.innerText = total;
    if (activeEl) activeEl.innerText = active;
    if (dueEl) dueEl.innerText = due;
    if (expiredEl) expiredEl.innerText = expired;
}


// INITIAL LOAD
if (recordsBody) {
    displayRecords(getRecords());
}


// SEARCH
// ====================
if (searchInput) {

    searchInput.addEventListener("keyup", function () {

        const searchText = searchInput.value.toLowerCase();
        const records = getRecords();

        const filtered = records.filter(record => {
            return (
                record.ownerName.toLowerCase().includes(searchText) ||
                record.vehicleNumber.toLowerCase().includes(searchText)
            );
        });

        // If no records found
        if (filtered.length === 0) {
            recordsBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center; padding:10px;">
                        No such result found
                    </td>
                </tr>
            `;
            return;
        }

        displayRecords(filtered);
    });
}


// ===============================
// RENEWAL PAGE
// ===============================

const renewalBody = document.getElementById("renewalBody");

if (renewalBody) {

    const records = getRecords();
    const today = new Date();

    records.forEach(record => {

        const expiryDate = new Date(record.expiryDate);
        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        let status = "Active";

        if (daysLeft < 0) status = "Expired";
        else if (daysLeft <= 30) status = "Renewal Due";

        renewalBody.innerHTML += `
            <tr>
                <td>${record.ownerName}</td>
                <td>${record.vehicleNumber}</td>
                <td>${record.expiryDate}</td>
                <td>${status}</td>
            </tr>
        `;
    });
}


// ===============================
// DELETE
// ===============================

window.deleteRecord = function (index) {

    const confirmDelete = confirm("Are you sure you want to delete this record?");

    if (!confirmDelete) return;

    let records = getRecords();

    records.splice(index, 1);

    localStorage.setItem("insuranceRecords", JSON.stringify(records));

    alert("Record deleted successfully!");

    location.reload();
};


// ===============================
// EDIT
// ===============================

window.editRecord = function (index) {

    localStorage.setItem("editIndex", index);

    window.location.href = "add_insurance.html";
};

function updateSummary() {

    const records =
        JSON.parse(localStorage.getItem("insuranceRecords")) || [];

    let active = 0;
    let renewals = 0;

    const today = new Date();

    records.forEach(record => {

        const expiry = new Date(record.expiryDate);
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (daysLeft > 30) {
            active++;
        }
        else if (daysLeft <= 30 && daysLeft >= 0) {
            renewals++;
        }
    });

    const activeEl = document.getElementById("summaryActive");
    const renewEl = document.getElementById("summaryRenewals");

    if (activeEl) activeEl.innerText = active;
    if (renewEl) renewEl.innerText = renewals;
}

document.addEventListener("DOMContentLoaded", function () {
    updateSummary();
});

const vehicleInput = document.getElementById("vehicleNumber");

vehicleInput.addEventListener("input", function () {

    let value = this.value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

    let formatted = "";

    if (value.length > 0)
        formatted += value.substring(0, 2);

    if (value.length > 2)
        formatted += "-" + value.substring(2, 4);

    if (value.length > 4)
        formatted += "-" + value.substring(4, 6);

    if (value.length > 6)
        formatted += "-" + value.substring(6, 10);

    this.value = formatted;
});

function checkRenewals() {
    const records = JSON.parse(localStorage.getItem("insuranceRecords")) || [];
    const today = new Date();

    records.forEach(record => {
        const expiryDate = new Date(record.expiryDate);

        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            console.log(`${record.ownerName}: Renewal Due`);
        }
        else if (diffDays <= 7) {
            console.log(`${record.ownerName}: Renewal Soon`);
        }
    });
}
document.addEventListener("DOMContentLoaded", checkRenewals);


// ===================================
// to download file in excel
// ===================================
function exportToExcel() {

    const records = getRecords();

    if (records.length === 0) {
        alert("No data to export!");
        return;
    }

    const data = records.map(r => ({
        Owner: r.ownerName,
        VehicleNumber: r.vehicleNumber,
        Type: r.vehicleType,
        Provider: r.insuranceProvider,
        StartDate: r.startDate,
        ExpiryDate: r.expiryDate,
        Premium: r.premiumAmount
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "InsuranceRecords");

    XLSX.writeFile(workbook, "Insurance_Records.xlsx");
}

function exportToPDF() {

    const records = getRecords();

    if (records.length === 0) {
        alert("No data to export!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Vehicle Insurance Records", 14, 10);

    const tableData = records.map(r => [
        r.ownerName,
        r.vehicleNumber,
        r.vehicleType,
        r.insuranceProvider,
        r.startDate,
        r.expiryDate,
        r.premiumAmount
    ]);

    doc.autoTable({
        head: [["Owner", "Vehicle", "Type", "Provider", "Start", "Expiry", "Premium"]],
        body: tableData,
        startY: 20
    });

    doc.save("Insurance_Records.pdf");
}