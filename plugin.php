<?php

/*
 * Plugin Name: PERT Estimator Dashboard Widget
 * Description: Dashboard widget for PERT estimation
 * Version: 0.9.1
 * Author: Paul V. Biron/Sparrow Hawk Computing
 * Author URI: https://sparrowhawkcomputing.com
 * Plugin URI: https:/github/pbiron/shc-pert-estimator
 * GitHub Plugin URI: https:/github/pbiron/shc-pert-estimator
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: shc-pert-estimator
 */

/**
 * The main plugin class.
 */
class SHC_Pert_Estimator_Plugin {
	/**
	 * Our static instance.
	 *
	 * @since 0.1.0
	 *
	 * @var SHC_Pert_Estimator_Plugin
	 */
	static $instance;

	/**
	 * Our version number.
	 *
	 * @since 0.1.0
	 *
	 * @var string
	 */
	const VERSION = '0.9.1';

	/**
	 * Get our instance.
	 *
	 * Calling this static method is preferable to calling the class
	 * constrcutor directly.
	 *
	 * @since 0.1.0
	 *
	 * @return SHC_Pert_Estimator_Plugin
	 */
	static function get_instance() {
		if ( ! self::$instance ) {
			self::$instance = new self;
		}

		return self::$instance;
	}

	/**
	 * Constructor.
	 *
	 * Initialize our static instance and add hooks.
	 *
	 * @since 0.1.0
	 *
	 * @return SHC_Pert_Estimator_Plugin
	 */
	function __construct() {
		if ( self::$instance ) {
			return self::$instance;
		}
		self::$instance = $this;

		load_plugin_textdomain( 'shc-pert-estimator', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );

		self::add_hooks();
	}

	/**
	 * Add hooks.
	 *
	 * @since 0.1.0
	 *
	 * @return void
	 */
	protected static function add_hooks() {
		// add our dashboard widget
		add_action( 'wp_dashboard_setup', array( __CLASS__, 'add_widget' ) );
		add_action( 'wp_network_dashboard_setup', array( __CLASS__, 'add_widget' ) );

		// save the user's "rates" values as user meta for next time.
		add_action( 'wp_ajax_shc-pert-estimator', array( __CLASS__, 'save_monetary_values' ) );

		return;
	}

	/**
	 * Save the user's "rates" values as user meta for next time.
	 *
	 * The first time the dashboard widget is shown these fields will be empty.
	 * Every time the user clicks the Calculate button whatever values they've
	 * entered in these fields will be saved as user meta for the next time the
	 * widget is shown.
	 *
	 * @since 0.1.0
	 *
	 * @return void Dies
	 *
	 * @action wp_ajax_shc-pert-estimator
	 */
	static function save_monetary_values() {
		$meta_value = array(
			'hourly_rate' => $_REQUEST['hourly_rate'],
			'contractor_fee' => $_REQUEST['contractor_fee'],
		);
		// calling intval should be enough sanitation of this user input
		// if anyone sees a reason why not, please let me know!
		$meta_value = array_map( 'intval', $meta_value );
		update_user_meta( get_current_user_id(), 'shc-pert-estimator', $meta_value );

		wp_send_json_success();
	}

	/**
	 * Add our dashboard widget.
	 *
	 * @since 0.1.0
	 *
	 * @return void
	 *
	 * @action wp_dashboard_setup, wp_network_dashboard_setup
	 */
	static function add_widget() {
		wp_add_dashboard_widget(
			'shc-pert-estimator',
			__( 'PERT Estimator', 'shc-pert-estimator' ),
			array( __CLASS__, 'render_widget' )
		);

		return;
	}

	/**
	 * Render our dashboard widget.
	 *
	 * This is the callback passed to `wp_add_dashboard_widget()`.
	 *
	 * @since 0.1.0
	 *
	 * @return void
	 */
	static function render_widget() {
		// enqueue our CSS and JS
		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';
		$rtl = is_rtl() ? '-rtl' : '';

		wp_enqueue_style(
			'shc-pert-estimator',
			plugins_url( "assets/css/pert{$rtl}{$suffix}.css", __FILE__ ),
			array(),
			self::VERSION
		);
		wp_enqueue_script(
			'shc-pert-estimator',
			plugins_url( "assets/js/pert{$suffix}.js", __FILE__ ),
			array( 'jquery' ),
			self::VERSION,
			true
		);

		// get the user's previous values, if any, for hourly_rate and contractor_fee
		$user_values = (array) get_user_meta( get_current_user_id(), 'shc-pert-estimator', true );
		$default_user_values = array(
			'hourly_rate' => '',
			'contractor_fee' => '',
		);
		$user_values = wp_parse_args( $user_values, $default_user_values );

 ?>
<form id='estimator'>
	<p>
		<?php echo sprintf(
			__( 'This can be used to calculate an estimated price for a project using the <a href="%s">PERT method</a>.', 'shc-pert-estimator' ),
			__( 'https://en.wikipedia.org/wiki/Program_evaluation_and_review_technique', 'shc-pert-estimator' )
			)
		?>
	</p>
	<p>
		<?php echo sprintf(
			__( 'Just enter the appropriate values in the %s and %s sections and click the %s button to see the estimate in the %s section.', 'shc-pert-estimator' ),
			'<strong>' . __( 'Estimates', 'shc-pert-estimator' ) . '</strong>',
			'<strong>' . __( 'Rates', 'shc-pert-estimator' ) . '</strong>',
			'<strong>' . __( 'Calculate', 'shc-pert-estimator' ) . '</strong>',
			'<strong>' . __( 'Totals', 'shc-pert-estimator' ) . '</strong>'
			) ?>
	</p>
	<div class='fields'>
		<fieldset>
			<legend><?php _e( 'Estimates', 'shc-pert-estimator' ) ?></legend>
			<p class='description'>
				<?php _e( 'Each value in this section is in hours.', 'shc-pert-estimator' ) ?>
			</p>
			<label>
				<span class='label'><?php _e( 'Optimistic', 'shc-pert-estimator' ) ?></span>
				<input id='optimistic_estimate' type='number' step='0.25' min='1' />
			</label>
			<label>
				<span class='label'><?php _e( 'Most likely', 'shc-pert-estimator' ) ?></span>
				<input id='likely_estimate' type='number' step='0.25' min='1' />
			</label>
			<label>
				<span class='label'><?php _e( 'Pessimistic', 'shc-pert-estimator' ) ?></span>
				<input id='pessimistic_estimate' type='number' step='0.25' min='1' />
			</label>
		</fieldset>
		<fieldset>
			<legend><?php _e( 'Rates', 'shc-pert-estimator' ) ?></legend>
			<label>
				<span class='label'><?php _e( 'Hourly rate', 'shc-pert-estimator' ) ?></span>
				<input id='hourly_rate' type='number' min='1' value='<?php echo $user_values['hourly_rate'] ?>' />
			</label>
			<label>
				<span class='label'><?php _e( 'Contractor fee (%)', 'shc-pert-estimator' ) ?></span>
				<input id='contractor_fee' type='number' min='0' value='<?php echo $user_values['contractor_fee'] ?>' />
			</label>
			<p class='description'>
				<?php
					_e( 'This fee will be added to the estimate, so that it can be passed on to the client. ', 'shc-pert-estimator' );
					_e( 'If your hourly rate already takes the Contractor Fee into account, you can set this to zero.', 'shc-pert-estimator' );
				 ?>
			</p>
		</fieldset>
		<fieldset>
			<legend><?php _e( 'Totals', 'shc-pert-estimator' ) ?></legend>
			<label>
				<span class='label'><?php _e( 'PERT Estimate (hours)', 'shc-pert-estimator' ) ?></span>
				<input id='estimate_hours' type='text' readonly='readonly'/>
			</label>
			<label>
				<span class='label'><?php _e( 'Estimate for client (including fees)', 'shc-pert-estimator' ) ?></span>
				<input id='estimate' type='text' readonly='readonly'/>
			</label>
			<label>
				<span class='label'><?php _e( 'What you get paid', 'shc-pert-estimator' ) ?></span>
				<input id='your_pay' type='text' readonly='readonly'/>
			</label>
		</fieldset>

		<input id='calculate' type='submit' class='button button-primary button-large' value='<?php _e( 'Calculate', 'shc-pert-estimator' ) ?>' />
	</div>
</form>
<?php

		return;
	}
}

// instantiate ourselves
SHC_Pert_Estimator_Plugin::get_instance();