function loadSessionObj(socket, sessionCollection) {

  if (!socket) {
    throw new Error('No socket provided');
  }

  if (!sessionCollection) {
    throw new Error('No sessionCollection provided');
  }

  let sessionId = socket.request.sessionID;

  return new Promise(async function(resolve, reject) {

    try {

      let session = await sessionCollection.findOne({
        _id: sessionId
      });
      let sessionObj = JSON.parse(session.session);

      resolve(sessionObj);

    } catch (err) {
      console.error(err);
      reject(err);
    }

  }).catch(function(err) {
    console.error(err);
  });

}

function saveSessionObj(socket, sessionCollection, sessionObj) {

  if (!socket) {
    throw new Error('No socket provided');
  }

  if (!sessionCollection) {
    throw new Error('No sessionCollection provided');
  }

  if (!sessionObj) {
    throw new Error('No sessionObject provided');
  }

  return new Promise(async function(resolve, reject) {

    try {

      var sessionId = socket.request.sessionID;

      var stringifiedSessionObj = JSON.stringify(sessionObj);
      console.info('stringifiedSessionObj: ' + stringifiedSessionObj);

      var updateResultStr = await sessionCollection.updateOne({
        _id: sessionId
      }, {
        $set: {
          session: stringifiedSessionObj
        }
      }, {
        upsert: true
      });

      var updateResult = JSON.parse(updateResultStr);
      var result = {};

      if (updateResult.ok) {
        result.status = 'success';
        result.message = 'Sitzung wurde erfolgreich aktualisiert';
      } else {
        result.status = 'error';
        result.message = 'Sitzung konnte nicht aktualisiert werden';
      }

      resolve(result);

    } catch(err) {
      console.error(err);
    }

  }).catch(function(err) {
    console.error(err);
  });

}

function Session(socket, sessionCollection) {

  if (!socket) {
    throw new Error('socket missing');
  }

  if (!sessionCollection) {
    throw new Error('sessionCollection missing');
  }

  /**
   * [set description]
   * @param {String} key   the key
   * @param {String} value the value
   */
  function set(key, value) {

    return new Promise(async function(resolve, reject) {

      try {

        var sessionObj = await loadSessionObj(socket, sessionCollection);

        socket.request.session[key] = value;
        sessionObj[key] = value;

        var sessionResult = await saveSessionObj(socket, sessionCollection, sessionObj);

        resolve(sessionResult);

      } catch(err) {
        console.error(err);
      }

    }).catch(function(err) {
      console.error(err);
    });

  }

  // convenience method
  function get(key) {

    return new Promise(async function(resolve, reject) {

      try {

        //let sessionObj = await loadSessionObj(socket, sessionCollection);

        let value = socket.request.session[key];
        //sessionObj[key] = value;

        let result;

        if (!value) {
          result = {
            status: 'FAILURE',
            message: `Could not find value in socket session for key "${key}"`
          }
        } else {
          result = {
            status: 'SUCCESS',
            message: `found value for key "${key}"`
          }
          result[key] = value;
        }

        resolve(result);

      } catch(err) {
        console.error(err);
      }

    }).catch(function(err) {
      console.error(err);
    });

  }

  function remove(key) {

    return new Promise(async function(resolve, reject) {

      try {

        let sessionObj = await loadSessionObj(socket, sessionCollection);
        delete sessionObj[key];
        let sessionResult = await saveSessionObj(socket, sessionCollection, sessionObj);
        let result = {};

        if (sessionResult.status === 'success') {
          result.status = 'success';
          result.message = 'Sitzung wurde erfolgreich beendet';
        } else {
          result.status = 'error';
          result.message = 'Sitzung konnte nicht beendet werden';
        }

        resolve(result);

      } catch(err) {
        console.error(err);
      }

    }).catch(function(err) {
      console.error(err);
    });

  }

  return {
    get: get,
    set: set,
    remove: remove
  };

}

module.exports = Session;
