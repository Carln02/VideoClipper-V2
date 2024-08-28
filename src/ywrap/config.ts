import * as core from "./plugins/core"
import * as blob from "./plugins/blob"

//  When changes are observed on a binding node, YWrap will attempt to call the camel-cased
//  "on<field><action>" function on all objects this node is currently bound to, eg. calling onPositionChanged
//  every time the field "position" gets updated.

//  This file allows you to configure which events should trigger which actions, setup any fallbacks that you
//  might need, and further customize the callback's <action> component under certain scenarios.

//  If a certain callback doesn't exist for a specific field, YWrap may attempt to call a catch-all version of the
//  callback with the <field> component omitted, passing in the affected field's name as the first parameter.



//  ==============
//  LOADED PLUGINS
//  ==============

//  TODO document section

export let load_plugins = [ core, blob ];



//  ===============
//  CHANGE BATCHING
//  ===============

//  TODO document section

export let batch_changes_ms = 100;
export let batch_changes_rolling = true;



//  ==============
//  SUBTREE EVENTS
//  ==============

//  TODO outdated

//  Whether bound classes should also receive events from their fields's subtrees or not.

//  If enabled, you may want to rewrite the callback's <action> component to differenciate these events,
//  eg. appending "Subtree" before it or forcing it to a specific value.

//  Keep in mind the callback's <field> component will always be set to the bound class's direct subfield that
//  contains the changes, with the specifically affected node passed as the callback's first argument.

export let subtree_events = true;



//  =====================
//  ACTIONS AND FALLBACKS
//  =====================

//  TODO outdated

//  For each YJS change type (add, update, or delete), the callback_formats field will specify
//  which callback functions YWrap should attempt to call on the node's bound objects, and in which order.

//  The "field_specific" parameter will tell YWrap whether it should try the field specific or the catch-all version of the
//  callback in this case, while the "action" parameter will simply specify the <action> component of said callback.

let added =		{ action: "Added",		arguments: change => [change.new] 				};
let updated =	{ action: "Updated",	arguments: change => [change.new, change.old]	};
let deleted =	{ action: "Deleted",	arguments: change => [change.old]				};
let changed =	{ action: "Changed",	arguments: change => [change.new, change.local]	};
let init = 		{ action: "Init",		arguments: change => [change.new]				};

export let events = {
	add: [
		{ ...added,		fallback: false },
		{ ...updated,	fallback: false },
		{ ...added,		fallback: true },
		{ ...updated,	fallback: true }
	],
	update: [
		{ ...updated,	fallback: false },
		{ ...updated,	fallback: true }
	],
	delete: [
		{ ...deleted,	fallback: false },
		{ ...updated,	fallback: false },
		{ ...deleted,	fallback: true },
		{ ...updated,	fallback: true }
	],
	generic: [
		{ ...changed,	fallback: false },
		{ ...changed,	fallback: true }
	],
	init: [
		{ ...init,		fallback: false },
		{ ...init,		fallback: true },
		{ ...added,		fallback: false },
		{ ...updated,	fallback: false },
		{ ...added,		fallback: true },
		{ ...updated,	fallback: true }
	]
}


