
	//const endpointUrl = "opc.tcp://192.168.75.180:4870"  
  const endpointUrl = "opc.tcp://192.168.43.43:4870"  
	// var HMI_user = require('./HMIUser.json') ;
var   opcua = require("node-opcua"),
	  async = require("async"),
      client = new opcua.OPCUAClient(),
	  opc_items = new Array(),
	  items_idx = 0,
	  monitored_items = new Array(),
	  the_session = null;
 
//message write in OPC UA 
var IP_flexy = [{
                nodeId: "ns=3;s=IP",
                attributeId: 11,
                indexRange: null,
                value: { 
                    value: { 
                        dataType: opcua.DataType.String,
                         value: '10.16.25.11'
                    }
              }
       }];
var pass_write = [{
                nodeId: "ns=3;s=passlog",
                attributeId: 13,
                indexRange: null,
                value: { 
                    value: { 
                        dataType: opcua.DataType.String,
                         value: ''
                    }
              }
       }];
	   
var step = [{
                nodeId: "ns=4;s=Step",
                attributeId: 14,
                indexRange: null,
                value: { 
                    value: { 
                        dataType: opcua.DataType.Int16,
                         value:2
                    }
              }
       }];
var Allid = [{
                nodeId: "ns=3;s=id",
                attributeId: 15,
                //indexRange: null,
                value: { 
                    value: { 
                        dataType: opcua.DataType.Int16,
                         arrayType: opcua.VariantArrayType.Array,
                         value:[]
                    }
              }
       }];

var login_trig = [{
                nodeId: "ns=3;s=LoginTrig",
                attributeId: 16,
                //indexRange: null,
                value: { 
                    value: { 
                        dataType: opcua.DataType.Boolean,
                        value: true

                    }
              }
       }];
/////////////////OPCUAClient//////////////////////////////////////////

async.series([


    // step 1 : connect to
    function(callback)  {

        client.connect(endpointUrl,function (err) {

            if(err) {
                console.log(" cannot connect to endpoint :" , endpointUrl );
            } else {
                console.log("connected !");
            }
            callback(err);
        });
    },
    // step 2 : createSession
    function(callback) {
        client.createSession(function(err,session) {
            if(!err) {
                the_session = session;
            }
            callback(err);
        });

    },
   
    // create subscription
    function(callback) {

        the_subscription=new opcua.ClientSubscription(the_session,{
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 10,
            requestedMaxKeepAliveCount: 2,
            maxNotificationsPerPublish: 10,
            publishingEnabled: true,
            priority: 10
        });
        the_subscription.on("started",function(){
            //console.log("subscription started for 2 seconds - subscriptionId=",the_subscription.subscriptionId);
        }).on("keepalive",function(){
           // console.log("keepalive");
        }).on("terminated",function(){
            callback();
        });		
			//array attriude
			ids =["Temperature","Flow","Tier1","Tier2"];
			
			// install monitored items
        //items_idx = 0;
       
			 ids.forEach(function (ids) {
			 var opc_item = "ns=3;s="+ids;
            monitored_items[items_idx] = the_subscription.monitor({
                nodeId: opcua.resolveNodeId(opc_item),
                attributeId: 13
            },
            {
                samplingInterval: 200,
                discardOldest: true,
                queueSize: 10
            });

             monitored_items[items_idx].on("changed", function (value) {
				     mesage =   '"TagName"' +':'+'"'+ids+'"'+','+ '"Value"'+":" + value.value.value ;
             console.log("data from flexy",mesage);
         
          
        
        


				//call IF 
				

            });

            items_idx = items_idx + 1;
        });
			
				

	},



    // ------------------------------------------------
    // closing session
    //
    function(callback) {
        console.log(" closing session");
       /* the_session.close(function(err){

            console.log(" session closed");
            callback();
        });*/
    },


],
    function(err) {
        if (err) {
            console.log(" failure ",err);
        } else {
            console.log("done!")
        }
      //  client.disconnect(function(){});
    }
	) ;
	


write_opcua(IP_flexy);

 


 
function write_opcua(datwrite)
{	   
the_session.write(datwrite, function(err,statusCode,diagnosticInfo) {
           if (!err) {
               console.log(" write ok" );
           }
      }); 
}


