import Poetry from 'poetry';
import Boom from 'boom';

import {
    Measurements
} from 'poetry/models';


Poetry.route( {

    method: 'POST',
    path: '/sigfox',
    config: {
        description: 'Sigfox',
        notes: [
            'Register new data from Sigfox network',
            'Requires a valid Sigfox JSON object, which cannot be empty.'
        ],
        tags: [ 'Gateway' ],

        payload: {
            override: 'application/json'
        }
    }

}, ( request, reply ) => {

    // Debug to visualize received datas
    Poetry.log.debug( "SIGFOX DATAS" );

    // Parse the JSON body
    /*let data,
        json = decodeURIComponent( request.payload )
        .replace( /\+/g, ' ' );
    try {
        data = JSON.parse( json.slice( 0, -1 ) );
    } catch ( err ) {
        return reply( Boom.badData( 'Request body must be a valid JSON' ) );
    }*/

    let data = request.payload;

    // Throw out when empty
    if ( !data || typeof data != 'object' || !Object.keys( data )
        .length )
        return reply( Boom.badData( 'Request body is empty' ) );

    Poetry.log.debug( JSON.stringify( request.payload ) );

    Measurements.insert( {

            version: 1,

            device: {
                id: data.device.toString(),
            },

            timestamp: new Date( data.time * 1000 ),
            payload: data.data,
            measurements: null,

            network: {
                name: 'sigfox',
                protocol: 'sigfox',
                signal: {
                    rssi: data.rssi,
                    snr: data.snr,
                    avgSnr: data.avgSnr
                },
                antenna: {
                    id: data.station,
                    lng: data.lng,
                    lat: data.lat
                },
                seqNumber: data.seqNumber
            }

        } )
        .then( ( data ) => {

            Poetry.log.info( 'Data saved', data.device.id, data.timestamp );

            reply( 'ok' )
                .code( 200 );

        } )
        .catch( ( err ) => {

            Poetry.log.error( 'Error saving data', data.device.id, data.timestamp );
            reply( err );

        } );

} );
