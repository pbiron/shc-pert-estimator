# PERT Estimator Dashboard Widget

Dashboard widget for PERT estimation

## Description

Adds a dashboard widget (including network dashboard for multisite) that allows you to calculate a project estimate based on the [PERT method](https://en.wikipedia.org/wiki/Program_evaluation_and_review_technique).

Just enter your **optimistic**, **most likely** and **pessimistic** estimates of how many hours the project will take and your **hourly rate** (and a **consultant's fee**, if applicable) and it will calculate the number of hours for the project and the total amount billable to the client.  

## Installation

Installation of this plugin works like any other plugin out there:

1. Upload the contents of the zip file to the '/wp-content/plugins/' directory
2. Activate the plugin through the 'Plugins' menu in WordPress

Alternatively, if you have the [Guthub Updater Plugin](https://github.com/afragen/github-updater) you can
use that to install (and update) this plugin.

If you install/update from GitHub Updater (or by locally cloning this repository), you will need to run the following commands:

    npm install
    grunt build 

## Screenshots

![The Dashboard widget in action](assets/images/screenshot-1.png?raw=true "The Dashboard widget in action")

## Frequently Asked Questions

### What is the PERT method?

PERT stands for [Program Evaluation and Review Technique](https://en.wikipedia.org/wiki/Program_evaluation_and_review_technique) and is a method for estimating the time a project will take in the face of uncertainty.

Basically, you come up with three ballpark time estimates:

* the _optimistic_ estimate (if everything goes better than planned...and you know this is the one we all naively believe we can hit)
* the _most likey_ estimate (if evertying goes just as planned)
* the _pessimistic_ estimate (if everything goes wrong)

The method then calculates a _weighted average_ of these three estimates according to:

    estimated_hours = ( _optimistic + ( 4 * likely ) + pessimistic ) / 6

This _weighted average_ helps account for the uncertainty in each of the original estimates and helps control for the unknowable.

For the math geeks out there, PERT is a special case of [Three-point estimation](https://en.wikipedia.org/wiki/Three-point_estimation) that uses the [PERT distribution](https://en.wikipedia.org/wiki/PERT_distribution).

## Changelog

### 0.9.1

* added "What you get paid" field to "Totals" section

### 0.9.0

* First version released on github

### 0.7.0

* save the `hourly_rate` and `consultant_fee` as user meta for next time

### 0.5.0

* tweaked the strings to better support localization
* produced the French translation to test the localization (I speak enough French to tell that Google Translate's translations were close enough for now)

### 0.3.0

* added localization

### 0.1.0

* init commit

## Got Ideas?
Please let me know by creating a new [issue](https://github.com/pbiron/shc-pert-estimator/issues) and describe your idea.  Pull Requests are welcome!

## Other Notes

I was inspired to write this plugin when I saw [this comment](https://community.codeable.io/t/pert-weighted-system-how-to-calculate-estimates/969/3) on the Codeable Community board (link private to the Codeable team).

## Buy me a beer

If you like this plugin, please support it's continued development by [buying me a beer](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=Z6D97FA595WSU).
