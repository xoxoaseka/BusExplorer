#!/usr/bin/env python

import json
import os
import argparse
import datetime
import pymongo
from datetime import datetime

# default format
# 2014-12-31T23:59:32.000-05:00,MTABC_Q23,MTA_502547,1,MTABC_4489,FOREST HILLS UNION TPK via 108 ST,17.694641,40.70659,-73.855297,Q23,MTA_Q230052,MTABC_7081977-LGDD4-LG_D4-Weekday-10

def readFile(hostName, user, password, fileName, numLines, dbName, collectionName, erase, skipHeader):
    print ("Reading from file %s into %s.%s. Erasing? %s")%(fileName, dbName, collectionName, erase)

    client = pymongo.MongoClient(host=[hostName])
    if user != None and password != None:
      client.the_database.authenticate(user, password, source=dbName)
    if erase:
        client.drop_database(dbName)

    db = client[dbName]
    collection = db[collectionName]
    collection.create_index([("VehicleLocation", pymongo.GEOSPHERE)])
    collection.create_index([("minute", 1)])
    collection.create_index([("hour", 1)])
    collection.create_index([("month", 1)])
    collection.create_index([("dayOfWeek", 1)])
    collection.create_index([("year", 1)])
    collection.create_index([("PublishedLineName", 1)])
    collection.create_index([("DirectionRef", 1)])
    collection.create_index([("RecordedAtTime", 1)])
    

    f = open(fileName)
    if skipHeader:
      f.readline()
    count = 0
    for line in f:
        tokens = line.rstrip().split(',')

        dateObj = datetime.strptime(tokens[0][0:-6], '%Y-%m-%dT%H:%M:%S.%f')
        # dateObj = datetime.strptime(tokens[0][1:-7], '%Y-%m-%dT%H:%M:%S.%f')
        hour = dateObj.hour
        dayOfWeek = dateObj.weekday()
        year = dateObj.year
        month = dateObj.month
        # quarter = dateObj.minute / 15 + 1
        minute = dateObj.minute

        lineRef = tokens[1]
        originRef = tokens[2]
        directionRef = int(tokens[3])
        vehicleRef = tokens[4]
        destinationName = tokens[5]
        bearing = float(tokens[6])
        loc = [float(tokens[8]),float(tokens[7])]
        publishedLineName = tokens[9]
        journeyPatternRef = tokens[10]
        datedVehicleJourneyRef = tokens[11]

        post = {'LineRef' : lineRef,\
              'OriginRef' : originRef,\
              'DirectionRef' : directionRef,\
              'VehicleRef' : vehicleRef,\
              'DestinationName' : destinationName,\
              'Bearing' : bearing,\
              'JourneyPatternRef': journeyPatternRef,\
              'DatedVehicleJourneyRef' : datedVehicleJourneyRef,\
              'OriginRef': originRef,\
              'RecordedAtTime': dateObj,\
              'VehicleLocation': loc,\
              'PublishedLineName': publishedLineName,\
              'hour': hour,\
              'dayOfWeek': dayOfWeek,
              'year': year,
              'month': month,
              'minute': minute}
        collection.insert(post)

        if count % 1000 == 0:
            print count
        count+=1

        if count == numLines:
            print 'Inserted %d lines'%(numLines)
            f.close()
            return
    f.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Import data from a csv file into mongodb.')
    parser.add_argument(action="store", dest="hostName", help='MongoDB hostname')
    parser.add_argument(action="store", dest="fileName", help='File name')
    parser.add_argument('-u', action="store", dest="user", help='MongoDB username', default=None)
    parser.add_argument('-p', action="store", dest="password", help='MongoDB password', default=None)
    parser.add_argument('-n', action="store", dest="numLines", help='Number of lines to read from input', type=int, default=-1)
    parser.add_argument('-d', action="store", dest="dbName", help='Database name', default='dot')
    parser.add_argument('-c', action="store", dest="collectionName", help='Collection name', default='bus')
    parser.add_argument('-e', action="store_true", dest="erase", help='If db already exists, erase it', default=False)
    parser.add_argument('-s', action="store_true", dest="skipHeader", help='Skip header', default=True)

    args = parser.parse_args()
    readFile(args.hostName, args.user, args.password, args.fileName, args.numLines, args.dbName, args.collectionName, args.erase, args.skipHeader)