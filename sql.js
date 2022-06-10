function getData(value) {
    const sqlite3 = require("sqlite3").verbose();

    const db = new sqlite3.Database('./mintdate.db', sqlite3.OPEN_READWRITE, (err)=>{
        if (err) return console.error(err.message);
    
        console.log("connection  successful");
    });

    const sql = `SELECT * FROM mintdate WHERE project_handle="${value}"`;

    return new Promise((resolve, reject)=>{
    db.serialize(()=>{
        db.get(sql, (err, rows)=>{
            if (err) {
                reject(err)
                console.log(value, " is not in our database!")
            }
                
            resolve(rows)
        })
    });
    })
}

module.exports = {getData};