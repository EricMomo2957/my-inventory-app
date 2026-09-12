const { initDatabase } = require('../config/initDatabase');
const db = require('../config/db');
const settingsController = require('../controllers/systemSettingsController');

async function testSuite() {
    console.log("1. Running database init...");
    await initDatabase();

    console.log("\n2. Testing getSettings controller...");
    const mockReq = {};
    const mockRes = {
        json: (data) => console.log("GET Settings:", data.success ? "SUCCESS" : "FAILED", "Settings keys:", Object.keys(data.settings || {})),
        status: (code) => ({ json: (d) => console.log("Status", code, d) })
    };
    await settingsController.getSettings(mockReq, mockRes);

    console.log("\n3. Testing sendLowStockDigest controller...");
    const mockDigestRes = {
        json: (data) => {
            console.log("Digest Dispatch:", data.success ? "SUCCESS" : "FAILED");
            console.log("Digest Summary:", data.digest?.summary);
        },
        status: (code) => ({ json: (d) => console.log("Status", code, d) })
    };
    await settingsController.sendLowStockDigest(mockReq, mockDigestRes);

    console.log("\n4. Testing exportBackup SQL generation...");
    const mockBackupRes = {
        headers: {},
        setHeader: (k, v) => { mockBackupRes.headers[k] = v; },
        send: (sql) => {
            console.log("SQL Backup Generated successfully!");
            console.log("SQL Length:", sql.length, "bytes");
            console.log("SQL Header preview:\n", sql.substring(0, 300));
        },
        status: (code) => ({ send: (d) => console.log("Status", code, d) })
    };
    await settingsController.exportBackup(mockReq, mockBackupRes);

    process.exit(0);
}

testSuite().catch(err => {
    console.error("Test error:", err);
    process.exit(1);
});
