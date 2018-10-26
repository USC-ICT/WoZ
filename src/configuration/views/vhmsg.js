// VHMSG JavaScript library
//
// written by Anton Leuski
//
// built upon the websocket example from ActiveMQ distribution
// uses stomp js client from https://github.com/jmesnil/stomp-websocket

// address, scope, secure?
function VHMSG() {
	this.address = "localhost";
	this.scope = "DEFAULT_SCOPE";
	this.secure = false;

	if (arguments.length > 0) this.address = arguments[0];
	if (arguments.length > 1) this.scope = arguments[1];
	if (arguments.length > 2) this.secure = arguments[2];

	this.client = null;
	this.reconnectAttempt = 0;
	this.subscriptions = [];
	this.subscriptionCounter = 0;
	this.destination = "/topic/" + this.scope;
}

VHMSG.prototype._onConnect = function () {
};
VHMSG.prototype._onError = function (frame) {
};

// address, scope, secure?
VHMSG.prototype.connect = function () {

	if (this.client != null) return;

	if (arguments.length > 0) this.address = arguments[0];
	if (arguments.length > 1) this.scope = arguments[1];
	if (arguments.length > 2) this.secure = arguments[2];

	this.destination = "/topic/" + this.scope;

	var url;

	if (this.secure) {
		url = "wss://" + this.address + ":61615/stomp";
	} else {
		url = "ws://" + this.address + ":61614/stomp";
	}

	this.client = Stomp.client(url);

	// as of ActiveMQ 5.8.0 there is a bug in ActiveMQ that disables heartbeats for websockets.
	// it causes the client to disconnect after about 5 minutes. We will work around the bug until
	// it's fixed AND iVH updates to the new library.
	// + HEARTBEAT
	// set the client timeout parameters as suggested
	// at https://github.com/jmesnil/stomp-websocket/issues/43
	this.client.heartbeat.outgoing = 0;
	this.client.heartbeat.incoming = 0;
	// - HEARTBEAT

	var _this = this;

	// this allows to display debug logs directly on the web page
	this.client.debug = _this.debug;

	// the client is notified when it is connected to the server.
	var thisOnConnect = function () {

		_this._onConnect();

		if (typeof _this.onConnect === "function") {
			_this.onConnect();
		}

		_this.reconnectAttempt = 0;

		for (var i = 0, n = _this.subscriptions.length; i < n; ++i) {
			var record = _this.subscriptions[i];
			_this.client.subscribe(_this.destination, record.callback, record.headers);
		}

		return false;
	};

	var thisOnError = function (frame) {

		_this._onError(frame);

		if (typeof _this.onError === "function") {
			_this.onError(frame);
		}

		_this.client = null;

		// + HEARTBEAT
		if (_this.reconnectAttempt > 3) {
			if (typeof _this.debug === "function") {
				_this.debug("giving up trying to reconnect");
			}

			_this.client = null;
			if (typeof _this.onDisconnect === "function") {
				_this.onDisconnect(false);
			}

		} else {
			if (typeof _this.debug === "function") {
				_this.debug("reconnecting");
			}
			++_this.reconnectAttempt;
			_this.connect();
		}
		// - HEARTBEAT

		return false;
	};

	this.client.connect("guest", "guest", thisOnConnect, thisOnError);
};

VHMSG.prototype.isConnected = function () {
	return this.client != null;
};

VHMSG.prototype.disconnect = function () {
	if (this.client == null) return;
	var _this = this;
	this.client.disconnect(function () {
		_this.client = null;
		if (typeof _this.onDisconnect === "function") {
			_this.onDisconnect(true);
		}
	});
};

// send(full message text)
// or send(header, message)
VHMSG.prototype.send = function () {
	if (this.client) {
		var text = Array.prototype.slice.call(arguments).join(" ").trim();
		if (text && text.length) {
			var arr = text.split(" ");
			if (arr.length > 0) {
				var first = arr.shift();
				var body = encodeURIComponent(arr.join(" ")).replace(/%20/g, "+");
				this.client.send(this.destination, {ELVISH_SCOPE: this.scope, MESSAGE_PREFIX: first}, first + " " + body);
			}
		}
	}
};

VHMSG.prototype.subscribe = function (vhHeader, callback) {

	var subscriptionRecord = {
		callback: function (message) {
			var arr = message.body.split(" ");
			var header = arr.length > 0 ? arr[0] : "";
			var body = arr.length > 1 ? arr[1] : "";
			callback(decodeURIComponent(body.replace(/\+/g, "%20")), header);
		},
		headers: {
			id: 'vh-' + this.subscriptionCounter++,
			selector: ((vhHeader && vhHeader != "*") ? ("MESSAGE_PREFIX='" + vhHeader + "' AND ") : "") + "ELVISH_SCOPE='" + this.scope + "'"
		}
	};

	this.subscriptions.push(subscriptionRecord);

	if (this.client) {
		this.client.subscribe(this.destination, subscriptionRecord.callback, subscriptionRecord.headers);
	}
};
