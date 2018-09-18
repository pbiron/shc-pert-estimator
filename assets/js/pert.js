/* global ajaxurl */

( function( $ ) {
	'use strict';

	/**
	 * Round to the nearest nth.
	 *
	 * @param {number} value The numeric value to round.
	 * @param {number} step The nth to round to (e.g., 0.5 will round 4.5968 to 4.5).
	 * @returns The rounded numeric value.
	 */
	function round( value, step ) {
		var inv = 1.0 / ( step || 1.0 );

		return Math.round( value * inv ) / inv;
	}

	/**
	 * Capture clicks on the "Calculate" button and compute the estimate.
	 *
	 * @todo report an error to the userif any of the input fields are
	 *       non-numeric, instead of forcing them to 0
	 */
	$( '#estimator' ).on( 'submit', function( event ) {
		event.stopPropagation();

		// get the various input field values
		// @todo the "|| 0" in each is in case the user hasn't entered a value
		//       it would probably be better to report the error to the user.
		var optimistic = parseFloat( $( '#optimistic_estimate' ).val() )   || 0.0,
			likely = parseFloat( $( '#likely_estimate' ).val() )           || 0.0,
			pessimistic = parseFloat( $( '#pessimistic_estimate' ).val() ) || 0.0,
			hourly_rate = parseFloat( $( '#hourly_rate' ).val() )          || 0.0,
			contractor_fee = parseFloat( $( '#contractor_fee' ).val() )    || 0.0;

		// use those values to calculate the estimate
		var estimate_hours = ( optimistic + 4 * likely + pessimistic ) / 6,
			estimate = estimate_hours * hourly_rate,
			estimate_with_fees = estimate / (1 - ( contractor_fee / 100 ) ),
			your_pay = estimate_hours * hourly_rate;

		// update the estimate with the calculated values
		$( '#estimate_hours' ).val( round( estimate_hours, 0.5 ) );
		$( '#estimate' ).val( Math.round( estimate_with_fees * 100 / 100 ) );
		$( '#your_pay' ).val( your_pay );

		// save the hourly_rate and contractor_fee as user meta for next time
		$.post( ajaxurl,
			{
				action: 'shc-pert-estimator',
				hourly_rate: hourly_rate,
				contractor_fee: contractor_fee
			}
		);

		return false;
	} );
} )( jQuery );
