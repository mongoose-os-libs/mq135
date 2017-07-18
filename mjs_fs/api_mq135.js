load('api_math.js');
load('api_adc.js');

let MQ = {

  PIN:undefined,
  // The load resistance on the board
  RLOAD:10.0,
  // Calibration resistance at atmospheric CO2 level
  RZERO:76.63,
  // Parameters for calculating ppm of CO2 from sensor resistance
  PARA:116.6020682,
  PARB:2.769034857,
  // Parameters to model temperature and humidity dependence
  CORA:0.00035,
  CORB:0.02718,
  CORC:1.39538,
  CORD:0.0018,
  //Atmospheric CO2 level for calibration purposes
  ATMOCO2:397.13,
  
  
  MQ135: {

		attach: function(pin) {
		 	MQ.PIN = pin;
		},

		/**
		* Get the resistance of the sensor, ie. the measurement value
		* @return The sensor resistance in kOhm
		*/
		getResistance: function() {
		  return ((1023/ADC.read(MQ.PIN)) * 5 - 1)*MQ.RLOAD;
		},

		/**
		* Get the ppm of CO2 sensed (assuming only CO2 in the air)
		* @return The ppm of CO2 in the air
		*/
		getPPM: function(pin) {
		  return Math.round(MQ.PARA * Math.pow((this.getResistance() / MQ.RZERO), -MQ.PARB));
		},

		/**
		 * Get the resistance RZero of the sensor for calibration purposes.
		 * Set this value to your "MQ.RZERO" variable if you need.
		 */
		getRZero: function() {
		  return this.getResistance() * Math.pow((MQ.ATMOCO2/MQ.PARA), (1/MQ.PARB));
		},

		/**
		* Get the correction factor to correct for temperature and humidity
		* @param[in] temperature  The ambient air temperature
		* @param[in] humidity  The relative humidity
		* @return The calculated correction factor
		*/
		getCorrectionFactor: function(temperature, humidity) {
		  return MQ.CORA * temperature * temperature - MQ.CORB * temperature + MQ.CORC - (humidity - 33) * MQ.CORD;
		},

		/**
		* Get the resistance of the sensor, ie. the measurement value corrected for temperature/humidity
		* @param[in] temperature  The ambient air temperature
		* @param[in] humidity  The relative humidity
		* @return The corrected sensor resistance kOhm
		*/
		getCorrectedResistance: function(temperature, humidity) {
		  return Math.round(this.getResistance() / this.getCorrectionFactor(temperature, humidity));
		},

		/**
		* Get the ppm of CO2 sensed (assuming only CO2 in the air), corrected for temperature/humidity
		* @param[in] temperature  The ambient air temperature
		* @param[in] humidity The relative humidity
		* @return The ppm of CO2 in the air
		*/
		getCorrectedPPM: function(temperature, humidity) {
		  return Math.round(MQ.PARA * Math.pow((this.getCorrectedResistance(temperature, humidity)/MQ.RZERO), -MQ.PARB));
		},

		/**
		* Get the resistance RZero of the sensor for calibration purposes
		* @param[in] temperature  The ambient air temperature
		* @param[in] humidity The relative humidity
		* @return The sensor resistance RZero in kOhm
		*/
		getCorrectedRZero: function(temperature, humidity) {
		  return this.getCorrectedResistance(temperature, humidity) * Math.pow((MQ.ATMOCO2/MQ.PARA), (1/MQ.PARB));
		},

	},

};