// ==UserScript==
// @name         LastFM Problematic Artist Checker
// @namespace    https://github.com/Awesomolocity/Lastfm-Problematic-Artist-Checker
// @downloadURL  https://github.com/Awesomolocity/Lastfm-Problematic-Artist-Checker/raw/master/index.user.js
// @version      1.0
// @description  Checks LastFM profiles for any problematic artists. It's worth remembering that a non-zero number doesn't necessarily mean the user in question is a nazi / nazi sympathizer. But it's still worth keeping an eye on it.
// @author       Awesomolocity
// @match        https://www.last.fm/user/*
// @exclude      https://www.last.fm/user/*/*
// @icon         https://www.google.com/s2/favicons?domain=last.fm
// ==/UserScript==

(function() {
	'use strict';
	
	function getArtistsFromRecentScrobbles(){
		return [... //Convert the set to an array
			new Set( //Sets are nice because they force uniqueness
				[...document.querySelectorAll('#recent-tracks-section .chartlist-artist')].map(
					chartlistArtist => chartlistArtist.innerText
				)
			)
		];
	}
	function getArtistsFromTopArtists(){
		return [...
			new Set(
				[...document.querySelectorAll('#top-artists .link-block-target')].map(
					topArtists => topArtists.innerText
				)
			)
		];
	}
	function getArtistsFromTopAlbums(){
		return [...
			new Set(
				[...document.querySelectorAll('#top-albums .grid-items-item-aux-block')].map(
					topAlbumsArtist => topAlbumsArtist.innerText
				)
			)
		];
	}
	function getArtistsFromTopTracks(){
		return [...
			new Set(
				[...document.querySelectorAll('#top-tracks .chartlist-artist')].map(
					chartlistArtist => chartlistArtist.innerText
				)
			)
		];
	}
	function getArtists(){
		return [...
			new Set(
				[].concat(
					getArtistsFromRecentScrobbles(),
					getArtistsFromTopArtists(),
					getArtistsFromTopAlbums(),
					getArtistsFromTopTracks()
				)
			)
		];
	}
	
	const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS70_P5rBBdArG539fGuRO3zS_Wt2Pm71_FeMwjQGBG-8iqGq9apAGMJuahBuMnRN_KpzPVc6R_lKSq/pub?output=csv';
	const request = new Request(sheetURL);
	fetch(request).then(response => {
		if(response.status === 200){
			return response.text();
		}
		else{
			throw new Error('Something went wrong getting the data from Google! :c')
		}
	}).then(response => {
		const artists = response.split('\r\n');
		artists.shift(); //First row is a header, so lets remove that
		
		const problematicArtistCount = getArtists().filter(artist => artists.includes(artist)).length;
		
		const span = document.createElement('span');
		span.innerText = ' • '+ problematicArtistCount + ' problematic artist'+ (problematicArtistCount===1?'':'s');
		
		document.querySelector('.header-scrobble-since').after(span);
	});
})();
