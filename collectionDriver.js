var ObjectID = require('mongodb').ObjectID;

mongoWrapper = function(db) {
  this.db = db;
};

mongoWrapper.prototype.getCollection = function(collectionName, callback) {
  this.db.collection(collectionName, function(error, currentCollection) {
    if( error ) callback(error);
    else callback(null, currentCollection);
  });
};

mongoWrapper.prototype.update = function(collectionName, obj, entityId, callback) {
    this.getCollection(collectionName, function(error, currentCollection) {
      if (error) {
        callback(error);
      } else {
        obj._id = ObjectID(entityId); 
        obj.updated_at = new Date(); 
        currentCollection.save(obj, function(error,doc) { 
            if (error){
              callback(error);
            } else {
              callback(null, obj);
            }
        });
      }
    });
};


mongoWrapper.prototype.delete = function(collectionName, entityId, callback) {
    this.getCollection(collectionName, function(error, currentCollection) { 
        if (error) {
          callback(error);
        } else {
          currentCollection.remove({'_id':ObjectID(entityId)}, function(error,doc) { 
            if (error) {
              callback(error);
            } else callback(null, doc);
          });
        }
    });
};

mongoWrapper.prototype.save = function(collectionName, obj, callback) {
    this.getCollection(collectionName, function(error, currentCollection) { 
      if( error ) callback(error)
      else {
        obj.created_at = new Date(); 
        obj.updated_at = new Date(); 
        currentCollection.insert(obj, function() { 
          callback(null, obj);
        });
      }
    });
};

mongoWrapper.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, currentCollection) { 
      if( error ) callback(error);
      else {
        currentCollection.find().toArray(function(error, results) { 
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};

mongoWrapper.prototype.get = function(collectionName, id, callback) { 
    this.getCollection(collectionName, function(error, currentCollection) {
        if (error) callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$"); 
            if (!checkForHexRegExp.test(id)) callback({error: "Invalid id"});
            else currentCollection.findOne({'_id':ObjectID(id)}, function(error,doc) { 
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};

exports.mongoWrapper = mongoWrapper;
