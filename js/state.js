/* state.js - Estado global compartido de la app */

let allResults        = [];
let activeTypeFilter  = 'all';
let activeUrgFilter   = 'all';
let collapsedSections = { keys: false, cat: false };
let timerInterval     = null;
