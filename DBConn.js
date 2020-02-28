const oracledb = require('oracledb')

class DBConn {
	constructor(DBInfo) {
		this.DBInfo = DBInfo
	}
	execute(statement, sequence=null, binds=[], opts={}) {
	  return new Promise(async (resolve, reject) => {
	    let conn
	    opts.outFormat = oracledb.OBJECT
	    opts.autoCommit = true
	    try {
	      conn = await oracledb.getConnection(this.DBInfo)
				const result = await conn.execute(statement, binds, opts)
				let lastRowid
				if (sequence != null) {
					lastRowid = await conn.execute(`SELECT ${sequence}.CURRVAL FROM dual`, binds, opts)
					result['lastRowid'] = await lastRowid.rows[0].CURRVAL
				}
	      resolve(result)
	    } catch (err) {
	      reject(err)
	    } finally {
	      if (conn) {
	        try {
	          await conn.close()
	        } catch (err) {
	          console.log(err)
	        }
	      }
	    }
	  })
	}
}

exports.DBConn = DBConn