from __future__ import absolute_import
from locu import MenuItemApiClient
from locu import VenueApiClient
from main.models import DishEntry
import datetime
import time

global KEY
KEY = '2d36afa81b05f641ec3382d9992b8cec3d64a4e4'


class Dish(object):

    def __init__(self,locu_object,queryset='',searchTime=None):
        self.venue_client = VenueApiClient(KEY)
        self.locu_object = locu_object
        self.parse_locu(self.locu_object)
        self.get_rating_db(queryset)



    def __eq__(self,other):
        return self.__dict__ == other.__dict__

    def __ne__(self, other):
        return not self.__eq__(other)

    def get_attr(self,attr):
        instance_variables = self.__dict__
        return instance_variables.get(attr)


    def parse_locu(self,locu_object):
        """
        Takes Locu Object and creates attributes dictonary.

        args:  
            locu_object: a json style dict with dish information
        """
        na = "Not Avalable"
        self.name = self.locu_object.get("name",na)
        self.description = self.locu_object.get("description",'')
        self.price = self.locu_object.get("price",na)
        self.venue = self.locu_object["venue"].get("name",na)
        self.venue_id = self.locu_object["venue"].get("id")
        self.categories = self.locu_object["venue"].get("categories")
        self.region= self.locu_object["venue"].get("region")
        self.locality = self.locu_object["venue"].get("locality")
        self.id = self.locu_object.get("id",na)

    def get_rating_db(self,queryset):
        """
        
        """
        if queryset:
            query = queryset.filter(name=self.name)
        else:
            query = DishEntry.objects.filter(venue_id=self.venue_id,name=self.name)
            
        if query.exists():
            self.db_entry = query[0]
        else:
            self.db_entry = DishEntry(name=self.name,venue_id=self.venue_id,avg_rating=0,ratings=0)
            self.db_entry.save()

        self.ratings = self.db_entry.ratings
        self.avg_rating = self.db_entry.avg_rating



    def rate(self,rating):
        """
        """
        total = self.avg_rating*self.ratings
        self.ratings += 1
        self.avg_rating = total+rating/(self.ratings)

        self.db_entry.avg_rating = self.avg_rating
        self.db_entry.ratings = self.ratings

        self.db_entry.save()

    @staticmethod
    def submit_rating(arg_venue_id, arg_name, rating):
        """
        """
        query = DishEntry.objects.filter(venue_id=arg_venue_id,name=arg_name)
        if query.exists():
            dish_entry = query[0]
            total = dish_entry.avg_rating*dish_entry.ratings

            dish_entry.ratings += 1
            dish_entry.avg_rating = (total+rating)/(dish_entry.ratings)
            '''
            self.db_entry.avg_rating = self.avg_rating
            self.db_entry.ratings = self.ratings

            self.db_entry.save()
            '''
            dish_entry.save()

        else:
            dish_entry = DishEntry(name=self.name,venue_id=self.venue_id,avg_rating=rating,ratings=rating)
            dish_entry.save()


if __name__ == '__main__':
    print "dish"









            




    

