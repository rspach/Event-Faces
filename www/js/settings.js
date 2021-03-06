/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var screen = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
   
   // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log("APP_LOG: SETTINGS.onDeviceReady!");    
        screen.getUserPrefs();
    },
            
    getUserPrefs: function() {
        var db = window.openDatabase("EventFacesDB", "", "Event Faces Database", 200000);
        db.transaction(this.callQueryDB, this.errorCB);
    },
            
    callQueryDB: function(tx) {
        console.log("APP_LOG: SETTINGS.callQueryDB()...!");
        screen.queryDB(tx);
    },
            
    queryDB: function(tx) {
        tx.executeSql('SELECT * FROM userPrefs', [], this.onQueryDBSuccess, this.errorCB);
    },
            
    onQueryDBSuccess: function(tx, results) {
        console.log('APP_LOG: onqueryDBSuccess()...');    
        var numRec = results.rows.length;
        console.log("APP_LOG: userPrefs.numRecords = " + numRec); 
        
        // Since there can only be 3 records in the userPrefs table:        
        // Set Facebook Preference
        var prefVal = results.rows.item(0).value;
        console.log("APP_LOG: fb_slider.val = " + prefVal);
        $("#fb_slider")[0].selectedIndex = prefVal;
        $('#fb_slider').slider('refresh'); 
        
        // Set Instagram Preference
        prefVal = results.rows.item(1).value;
        console.log("APP_LOG: inst_slider.val = " + prefVal);
        $("#inst_slider")[0].selectedIndex = prefVal;
        $('#inst_slider').slider('refresh');
        
        // Set Facebook Preference
        prefVal = results.rows.item(2).value;
        console.log("APP_LOG: geo_slider.val = " + prefVal);
        $("#geo_slider")[0].selectedIndex = prefVal;
        $('#geo_slider').slider('refresh');   
        
       screen.callGetSocialLogin(tx);
    },  
    
    callGetSocialLogin: function(tx) { 
        tx.executeSql('SELECT * FROM social', [], this.onGetSocialLoginSuccess, this.errorCB);
    },
            
    onGetSocialLoginSuccess: function(tx, results) {
        var numRec = results.rows.length, i;
        console.log("APP_LOG: social.numRecords = " + numRec); 
        
        if (numRec > 0) {            
            for (i=0; i<numRec; i++) {
                console.log(results.rows.item(i).id);
                console.log(results.rows.item(i).site);
                console.log(results.rows.item(i).user);
                console.log(results.rows.item(i).pass);
                
                var site = results.rows.item(i).site;
                var user = results.rows.item(i).user;
                var pass = results.rows.item(i).pass;
                
                if (site === 'FACEBOOK') {
                    $("#usernameTxt").prop("value", user);
                    $("#pwdTxt").prop("value", pass);
                }
                else if (site === 'INSTAGRAM') {
                    $("#inst_usernameTxt").prop("value", user);
                    $("#inst_pwdTxt").prop("value", pass);
                }
            }            
        }
    },
    
    submitSettings: function() {
        console.log("APP_LOG: SETTINGS.submitSettings()");
        var geoTag = $("#geo_slider").val();
        var fb = $("#fb_slider").val();
        var inst = $("#inst_slider").val();
        
        console.log("APP_LOG: SETTINGS.geoTag = " + geoTag);     
        console.log("APP_LOG: SETTINGS.fb = " + fb);     
        console.log("APP_LOG: SETTINGS.inst = " + inst);
        
        window.localStorage.setItem("frm_geoTag", geoTag);
        window.localStorage.setItem("frm_fb", fb);
        window.localStorage.setItem("frm_inst", inst);
        
        var db = window.openDatabase("EventFacesDB", "", "Event Faces Database", 200000);
        db.transaction(this.updateDB, this.errorCB);
        
        console.log('APP_LOG: dispatched updateDB()!');
    },
            
    updateDB: function(tx) {
        var frm_geotag = window.localStorage.getItem("frm_geoTag");        
        var query = "UPDATE userPrefs SET value='" + frm_geotag + "' WHERE prefKey='GEOTAG'";
        console.log('APP_LOG: SETTINGS.query => ' + query);
        screen.updateGeoTag(tx, query);
    },
            
    updateGeoTag: function(tx, query) {
        tx.executeSql(query, [], this.onUpdateGeoTagSuccess, this.errorCB);
    },
            
    onUpdateGeoTagSuccess: function(tx, results) {
        console.log('APP_LOG: SETTINGS:: onUpdateGeoTagSuccess()!');
        screen.updateFacebook(tx);
    },
            
    updateFacebook: function(tx) {
        var frm_fb = window.localStorage.getItem("frm_fb");        
        var query = "UPDATE userPrefs SET value='" + frm_fb + "' WHERE prefKey='FACEBOOK'";
        tx.executeSql(query, [], this.onUpdateFacebookSuccess, this.errorCB);
    },
            
    onUpdateFacebookSuccess: function(tx, results) {
        console.log('APP_LOG: SETTINGS:: onUpdateFacebookSuccess()!');
        screen.updateInstagram(tx);
    },
    
    updateInstagram: function(tx) {
        var frm_inst = window.localStorage.getItem("frm_inst");        
        var query = "UPDATE userPrefs SET value='" + frm_inst + "' WHERE prefKey='INSTAGRAM'";
        tx.executeSql(query, [], this.onUpdateInstagramSuccess, this.errorCB);
    },
            
    onUpdateInstagramSuccess: function(tx, results) {
        console.log('APP_LOG: SETTINGS:: onUpdateInstagramSuccess()!');
        screen.updateSocialFacebook(tx);
    },
    
    updateSocialFacebook: function(tx) {
        var fbUser = $("#usernameTxt").val();
        var fbPass = $("#pwdTxt").val();
        var query = "UPDATE social SET user='" + fbUser + "', pass='" + fbPass + "' WHERE site='FACEBOOK'";
        tx.executeSql(query, [], this.onUpdateSocialFacebook, this.errorCB);
    },
            
    onUpdateSocialFacebook: function(tx, results) {
        console.log('APP_LOG: SETTINGS:: onUpdateSocialFacebook()!');
        screen.updateSocialInstagram(tx);
    },
    
    updateSocialInstagram: function(tx) {
        var iUser = $("#inst_usernameTxt").val();
        var iPass = $("#inst_pwdTxt").val();
        var query = "UPDATE social SET user='" + iUser + "', pass='" + iPass + "' WHERE site='INSTAGRAM'";
        tx.executeSql(query, [], this.onUpdateSocialInstagram, this.errorCB);
    },
            
    onUpdateSocialInstagram: function(tx, results) {
        console.log('APP_LOG: SETTINGS:: onUpdateSocialInstagram()!');
        screen.allDone();
    },
            
    errorCB: function(err) {
        console.log("APP_LOG: SETTINGS::Error processing SQL: "+ err.message);
    },
            
    allDone: function() {
       // Redirect to the Main Menu Screen
        window.location='./main.html'; 
    }
    
};