
#Slideshow theme specific

from Products.Five import BrowserView
import json
from zope.component import getMultiAdapter
from Products.CMFCore.utils import getToolByName
from collective.leadmedia.interfaces import ICanContainMedia
from zope.schema import getFieldsInOrder
from plone.dexterity.interfaces import IDexterityFTI
from zope.component import getUtility
from Products.CMFCore.utils import getToolByName
from zope.i18nmessageid import MessageFactory

MessageFactory = MessageFactory('collective.object')


class get_nav_objects(BrowserView):
    """
    Utils
    """
    def get_slideshow_items(self):
        item = self.context
        order = self.request.get('sort_on')
        catalog = getToolByName(self.context, 'portal_catalog')

        scale = "/@@images/image/large"

        items = []

        if item.portal_type == "Object":
            if hasattr(item, 'slideshow'):
                slideshow = item['slideshow']
                path = '/'.join(slideshow.getPhysicalPath())

                if order == None:
                    order = 'getObjPositionInParent'

                results = catalog.searchResults(path={'query': path, 'depth': 1}, sort_on=order)
                for brain in results:
                    url = brain.getObject().absolute_url()
                    slideshow_url = "%s%s" %(url, scale)
                    items.append({'url':slideshow_url})

        return json.dumps(items)


    def get_object_idx(self, results, object_id, is_folder):
        if is_folder:
            for idx, res in enumerate(results):
                if res.getId == object_id:
                    return idx
        else:
            for idx, res in enumerate(results):
                if res.getId() == object_id:
                    return idx

    def get_all_batch(self, collection_object, is_folder):
        catalog = getToolByName(self.context, 'portal_catalog')

        if is_folder:
            collection_obj = collection_object
        else:
            collection_obj = collection_object.getObject()
        if is_folder:
            folder_path = '/'.join(collection_obj.getPhysicalPath())
            results = catalog(path={'query': folder_path, 'depth': 1})
        else:
            results = collection_obj.queryCatalog(batch=False)

        #print results
        return results

    def get_batch(self, collection_object, start, pagesize=33):
        collection_obj = collection_object.getObject()
        results = collection_obj.queryCatalog(batch=True, b_start=int(start), b_size=pagesize)
        return results

    """
    Get prev obj
    """
    def get_prev_obj(self, start, collection_id):
        pagesize = 33
        
        if "/" not in start:
            object_id = self.context.getId()
            catalog = getToolByName(self.context, 'portal_catalog')
            search_results = catalog.searchResults({'UID':collection_id})

            if len(search_results) > 0:
                collection_object = search_results[0]
                if collection_object.portal_type == "Collection":
                    ## Get Batch of collection
                    results = self.get_batch(collection_object, start, pagesize)
                    
                    ## Get prev item
                    object_idx = self.get_object_idx(results, object_id)                    
                    if object_idx > 0:
                        return results[object_idx-1]
                    else:
                        if results.has_previous:
                            page = results.previouspage
                            start = int(start)
                            start = (page * pagesize) - pagesize
                            b_results = self.get_batch(collection_object, start, pagesize)
                            last_element = b_results[b_results.items_on_page-1]
                            return last_element
                        else:
                            lastpage = results.lastpage
                            start = int(start)
                            start = (lastpage * pagesize) - pagesize
                            b_results = self.get_batch(collection_object, start, pagesize)
                            last_element = b_results[b_results.items_on_page-1]
                            return last_element
    """
    Get next obj
    """
    def get_next_obj(self, start, collection_id):
        pagesize = 33

        if "/" not in start:
            object_id = self.context.getId()
            catalog = getToolByName(self.context, 'portal_catalog')
            search_results = catalog.searchResults({'UID':collection_id})

            if len(search_results) > 0:
                collection_object = search_results[0]
                if collection_object.portal_type == "Collection":
                    results = self.get_batch(collection_object, start, pagesize)
                    object_idx = self.get_object_idx(results, object_id)
                    if object_idx < results.items_on_page-1:
                        return results[object_idx+1]
                    else:
                        if results.has_next:
                            page = results.nextpage
                            page -= 1
                            start = int(start)
                            start = (page * pagesize)
                            b_results = self.get_batch(collection_object, start, pagesize)
                            first_element = b_results[0]
                            return first_element
                        else:
                            start = 0
                            b_results = self.get_batch(collection_object, start, pagesize)
                            first_element = b_results[0]
                            return first_element

    def get_collection_from_catalog(self, collection_id):
        catalog = getToolByName(self.context, 'portal_catalog')
        search_results = catalog.searchResults({'UID':collection_id})
        if len(search_results) > 0:
            collection_object = search_results[0]
            if collection_object.portal_type == "Collection":
                return collection_object

        return None

    def get_all_items_from_collection(self, collection_object):
        items = {
            "list":[],
            "object_idx":0,
            'total':False
        }

        results = self.get_all_batch(collection_object, False)
        object_idx = self.get_object_idx(results, self.context.getId())
        items['object_idx'] = object_idx

        for obj in results:
            if obj != None:
                obj_media = ICanContainMedia(obj.getObject()).getLeadMedia()
                if obj_media != None:
                    items['list'].append({'url':obj.getURL(),'image_url': obj_media.absolute_url()+'/@@images/image/large', 'object_id': obj.getId(), 'title':obj.Title(), 'description': obj.Description(), 'body': ""})

        return items

    """
    AJAX to get all items inside collection
    """
    def get_all_collection(self):
        collection_id = self.request.get('collection_id')
        items = []
        
        if collection_id != None:
            collection_object = self.get_collection_from_catalog(collection_id)
            if collection_object != None:
                ## Get Batch of collection
                items = self.get_all_items_from_collection(collection_object)

        return json.dumps(items)

    def get_multiple_images(self, _object, view_type):
        images = []
        
        if view_type == 'double_view':
            limit = 2
            curr = 0
            if hasattr(_object, 'slideshow'):
                slideshow = _object['slideshow']
                if slideshow.portal_type == "Folder":
                    for img in slideshow:
                        curr += 1 
                        if slideshow[img].portal_type == 'Image':
                            images.append(slideshow[img].absolute_url()+'/@@images/image/large')
                        if curr >= limit:
                            break

        elif view_type == 'multiple_view':
            if hasattr(_object, 'slideshow'):
                slideshow = _object['slideshow']
                if slideshow.portal_type == "Folder":
                    for img in slideshow:
                        if slideshow[img].portal_type == 'Image':
                            images.append(slideshow[img].absolute_url()+'/@@images/image/large')

        res = sorted(images)
        return res

    def trim_white_spaces(self, text):
        if text != "" and text != None:
            if len(text) > 0:
                if text[0] == " ":
                    text = text[1:]
                if len(text) > 0:
                    if text[-1] == " ":
                        text = text[:-1]
                return text
            else:
                return ""
        else:
            return ""

    def create_author_name(self, value):
        comma_split = value.split(",")

        for i in range(len(comma_split)):       
            name_split = comma_split[i].split('(')
            
            raw_name = name_split[0]
            name_split[0] = self.trim_white_spaces(raw_name)
            name_artist = name_split[0]
            
            name_artist_link = '<a href="/'+self.context.language+'/search?SearchableText=%s">%s</a>' % (name_artist, name_artist)
            name_split[0] = name_artist_link

            if len(name_split) > 1:
                if len(name_split[1]) > 0:
                    name_split[0] = name_artist_link + " "
        
            comma_split[i] = '('.join(name_split)

        _value = ", ".join(comma_split)

        return _value

    def create_materials(self, value):
        materials = value.split(',')
        _value = ""
        for i, mat in enumerate(materials):
            if i == (len(materials)-1):
                _value += '<a href="/'+self.context.language+'/search?SearchableText=%s">%s</a>' % (mat, mat)
            else:
                _value += '<a href="/'+self.context.language+'/search?SearchableText=%s">%s</a>, ' % (mat, mat)

        return _value

    def get_all_fields_object(self, object):

        object_schema = []
        schema = getUtility(IDexterityFTI, name='Object').lookupSchema()

        if object.portal_type in ["Object"]:
            for name, field in getFieldsInOrder(schema):
                if name not in ["text"] and name in ['title', 'identification_objectName_objectName', 'identification_objectName_objectCategory',
                                                        'identification_identification_collection',
                                                        'productionDating_dating_period', 'physicalCharacteristics_materials',
                                                        'identification_identification_objectNumber', 'physicalCharacteristics_dimensions']:
                    value = getattr(object, name, '')
                    if value != None and value != '':
                        if name in ['technique', 'artist', 'material', 'object_type', 'object_category', 'publisher', 'author', 'identification_identification_objectNumber']:
                            if (name == 'artist') or (name == 'author'):
                                _value = self.create_author_name(value)
                                value = _value
                            elif (name == 'material') or (name == 'technique'):
                                _value = self.create_materials(value)
                                value = _value
                            else:
                                _value = '<a href="/'+self.context.language+'/search?SearchableText=%s">%s</a>' % (value, value)
                                value = _value

                        _title = MessageFactory(field.title)
                        new_attr = {"title": self.context.translate(_title), "value": value, "name": name}
                        
                        if type(new_attr['value']) != list:
                            if name in ['artist', 'author']:
                                object_schema.insert(0, new_attr)
                            else:
                                object_schema.append(new_attr)
                        else:
                            if name in ['productionDating_dating_period']:
                                new_val = []

                                for val in new_attr['value']:
                                    if val['date_early'] != val['date_late']:
                                        if val['date_early_precision'] != None and val['date_early_precision'] != "":
                                            new_val.append("%s %s - %s" % (val['date_early_precision'], val['date_early'], val['date_late']))
                                        else:
                                            new_val.append("%s - %s" % (val['date_early'], val['date_late']))
                                    else:
                                        if val['date_early_precision'] != None and val['date_early_precision'] != "":
                                            new_val.append("%s %s" % (val['date_early_precision'], val['date_early']))
                                        else:
                                            new_val.append("%s" % (val['date_early']))

                                new_val_str = '<p>'.join(new_val)
                                if len(new_val) > 0:
                                    if new_val_str != "":
                                        new_attr['value'] = new_val_str
                                object_schema.append(new_attr)

                            elif name in ['physicalCharacteristics_dimensions']:
                                new_val = []
                                for val in new_attr['value']:
                                    new_val.append("%s: %s %s" % (val['dimension'], val['value'], val['unit']))

                                new_val_str = '<p>'.join(new_val)
                                if len(new_val) > 0:
                                    if new_val_str != "":
                                        new_attr['value'] = new_val_str
                                    
                                object_schema.append(new_attr)
                            else:
                                new_val = []
                                for val in new_attr['value']:
                                    dict_val = []
                                    for key in val:
                                        if val[key] != "" and val[key] != None:
                                            dict_val.append("<a href='/%s/%s%s'>%s</a>" %(str(self.context.language),"search?SearchableText=",val[key],val[key]))
                                    
                                    dict_val_str = ", ".join(dict_val)
                                    new_val.append(dict_val_str)

                                if name in ['physicalCharacteristics_materials']:
                                    new_val_str = ', '.join(new_val)
                                else:
                                    new_val_str = '<p>'.join(new_val)
                                if len(new_val) > 0:
                                    if new_val_str != "":
                                        new_attr['value'] = new_val_str
                                else:
                                    new_attr['value'] = ""
                                object_schema.append(new_attr)
            
            object_title = getattr(object, 'title', '')
            new_attr = {'title': self.context.translate('Title'), "value": object_title}

            if len(object_schema) > 1 and object_schema[0]['name'] == "author":
                if object_schema[1]['name'] == "illustrator":
                    if object.book_title != '':
                        new_attr = {'title': self.context.translate('Title'), "value": object.book_title}
                        object_schema.insert(2, new_attr)
                else:
                    if object.book_title != '':
                        new_attr = {'title': self.context.translate('Title'), "value": object.book_title}
                        object_schema.insert(1, new_attr)

            if len(object_schema) > 1 and object_schema[0]['name'] == "artist":
                object_schema.insert(1, new_attr)
            elif len(object_schema) > 1 and object_schema[0]['name'] != "artist" and object_schema[0]['name'] != "author":
                object_schema.insert(0, new_attr)

            obj_body = self.get_object_body(object)
            object_schema.append({"title": "body", "value":obj_body})
        else:
            object_schema = []

        return object_schema

    def build_json_with_list(self, list_items, object_idx, total, is_folder, total_items):
        items = {
            'list':[],
            'object_idx':object_idx,
            'total': total,
            'has_list_images':False,
            'view_type': 'regular',
            'total_items': 0
        }

        state = getMultiAdapter(
                (self.context, self.request),
                name=u'plone_context_state')

        # Check view type
        view_type = state.view_template_id()

        if view_type == "double_view" or view_type == "multiple_view":
            items["has_list_images"] = True
            items["view_type"] = view_type

        items['total_items'] = total_items

        if is_folder:
            for obj in list_items:
                obj_media = ICanContainMedia(obj.getObject()).getLeadMedia()
                if obj_media != None:
                    schema = self.get_all_fields_object(obj.getObject())
                    if not items['has_list_images']:
                        items['list'].append({'schema':schema, 'url':obj.getURL(),'image_url': obj_media.absolute_url()+'/@@images/image/large', 'object_id': obj.getId, 'title':obj.Title, 'description': obj.Description, 'body': self.get_object_body(obj.getObject())})
                    else:
                        items['list'].append({'schema':schema, 'images':self.get_multiple_images(obj.getObject(), view_type), 'url':obj.getURL(),'image_url': obj_media.absolute_url()+'/@@images/image/large', 'object_id': obj.getId, 'title':obj.Title, 'description': obj.Description, 'body': self.get_object_body(obj.getObject())})    
                else:
                    schema = self.get_all_fields_object(obj.getObject())
                    items['list'].append({'schema':schema, 'url':obj.getURL(),'image_url': '', 'object_id': obj.getId, 'title':obj.Title, 'description': obj.Description, 'body': self.get_object_body(obj.getObject())})

        else:
            for obj in list_items:
                obj_media = ICanContainMedia(obj.getObject()).getLeadMedia()
                if obj_media != None:
                    schema = self.get_all_fields_object(obj.getObject())
                    if not items['has_list_images']:
                        items['list'].append({'schema':schema, 'url':obj.getURL(),'image_url': obj_media.absolute_url()+'/@@images/image/large', 'object_id': obj.getId(), 'title':obj.Title(), 'description': obj.Description(), 'body': self.get_object_body(obj)})
                    else:
                        items['list'].append({'schema':schema, 'images':self.get_multiple_images(obj.getObject(), view_type), 'url':obj.getURL(),'image_url': obj_media.absolute_url()+'/@@images/image/large', 'object_id': obj.getId(), 'title':obj.Title(), 'description': obj.Description(), 'body': self.get_object_body(obj)})        

                else:
                    items['list'].append({'schema':schema, 'url':obj.getURL(),'image_url': '', 'object_id': obj.getId(), 'title':obj.Title(), 'description': obj.Description(), 'body': self.get_object_body(obj)})
                         
        return items

    """
    Get bulk of prev items
    """
    def get_prev_objects(self):
        bulk = 30
        b_start = self.request.get('b_start')
        collection_id = self.request.get('collection_id')
        object_id = self.request.get('object_id')

        if b_start != None and collection_id != None and object_id != None:
            collection_object = self.get_collection_from_catalog(collection_id)
            results = self.get_all_batch(collection_object, False)
            object_idx = self.get_object_idx(results, object_id)

            if object_idx-bulk >= 0:
                list_of_items = list(results)
                bulk_of_items = list_of_items[(object_idx-bulk):object_idx]
                items = self.build_json_with_list(bulk_of_items, 0, False, False, len(list_of_items))
                items['list'] = list(reversed(items['list']))
                return json.dumps(items)

        return json.dumps({'list':[], 'object_idx':0})

    """
    Get bulk of next items
    """
    def get_next_objects(self):
        bulk = 30
        b_start = self.request.get('b_start')
        collection_id = self.request.get('collection_id')
        object_id = self.request.get('object_id')
        req_bulk = self.request.get('bulk')

        if req_bulk != None:
            buffer_size = int(req_bulk)

        is_collection = False
        is_folder = False
        if b_start != None and collection_id != None:
            is_collection = True
        else:
            if self.context.getParentNode() != None:
                parent = self.context.getParentNode();
                if parent.portal_type == 'Folder':
                    is_folder = True

        if not (is_folder == False and is_collection == False) and object_id != None:
            if is_collection:
                collection_object = self.get_collection_from_catalog(collection_id)
            else:
                collection_object = parent

            results = self.get_all_batch(collection_object, is_folder)
            object_idx = self.get_object_idx(results, object_id, is_folder)

            if object_idx+bulk < len(results):
                list_of_items = list(results)
                bulk_of_items = list_of_items[(object_idx+1):(object_idx+bulk+1)]
                items = self.build_json_with_list(bulk_of_items, 0, False, is_folder, len(list_of_items))
                return json.dumps(items)
            
            elif object_idx+bulk >= len(results):
                list_of_items = list(results)
                offset = (object_idx+bulk) - len(results)
                bulk_of_items = list_of_items[(object_idx+1):] + list_of_items[0:(offset+1)]
                items = self.build_json_with_list(bulk_of_items, 0, True, is_folder, len(list_of_items))
                return json.dumps(items)

        return json.dumps({'list':[], 'object_idx':0, 'total':False})

    def get_object_body(self, object):
        if hasattr(object, 'text') and object.text != None:
            return object.text.output
        else:
            return ""

    def getJSON(self):
        pagesize = 33
        
        buffer_size = 30
        b_start = self.request.get('b_start')
        collection_id = self.request.get('collection_id')
        req_bulk = self.request.get('bulk')

        if req_bulk != None:
            buffer_size = int(req_bulk)

        items = {}

        is_folder = False
        is_collection = False

        if b_start != None and collection_id != None:
            is_collection = True
        else:
            if self.context.getParentNode() != None:
                parent = self.context.getParentNode();
                if parent.portal_type == 'Folder':
                    is_folder = True

        if not (is_folder == False and is_collection == False): 
            if is_collection:
                collection_object = self.get_collection_from_catalog(collection_id)
            else:
                collection_object = parent

            current_id = self.context.getId()

            results = self.get_all_batch(collection_object, is_folder)
            object_idx = self.get_object_idx(results, current_id, is_folder)

            if object_idx-buffer_size >= 0 and object_idx+buffer_size < len(results):
                list_of_items = list(results)
                
                prev_items = list_of_items[(object_idx-buffer_size):object_idx]
                next_items = list_of_items[object_idx:(object_idx+buffer_size+1)]

                bulk_of_items = next_items + prev_items
                
                items = self.build_json_with_list(bulk_of_items, 0, False, is_folder, len(list_of_items))
                items['index_obj'] = object_idx+1
                return json.dumps(items)
            
            elif object_idx-buffer_size < 0 and object_idx+buffer_size < len(results):
                #fetch from last page
                offset = object_idx-buffer_size
                
                list_of_items = list(results)
                prev_items = list_of_items[offset:] + list_of_items[0:object_idx]
                next_items = list_of_items[object_idx:(object_idx+buffer_size+1)]

                bulk_of_items = next_items + prev_items
                
                items = self.build_json_with_list(bulk_of_items, 0, False, is_folder, len(list_of_items))
                items['index_obj'] = object_idx+1
                return json.dumps(items)

            elif object_idx+buffer_size >= len(results) and object_idx-buffer_size > 0:
                list_of_items = list(results)

                offset = (object_idx+buffer_size) - len(results)

                prev_items = list_of_items[(object_idx-buffer_size):object_idx]
                next_items = list_of_items[object_idx:] + list_of_items[0:(offset+1)]

                bulk_of_items = next_items + prev_items
                items = self.build_json_with_list(bulk_of_items, 0, False, is_folder, len(list_of_items))
                items['index_obj'] = object_idx+1
                return json.dumps(items)

            elif object_idx+buffer_size >= len(results) and object_idx-buffer_size < 0:
                list_of_items = list(results)

                prev_items = list_of_items[0:object_idx]
                next_items = list_of_items[object_idx:]

                bulk_of_items = next_items + prev_items
                items = self.build_json_with_list(bulk_of_items, 0, True, is_folder, len(list_of_items))
                items['index_obj'] = object_idx+1
                return json.dumps(items)
        else:
            return json.dumps(items);


class get_slideshow_options(BrowserView):
    """
    AJAX call to get slideshow options
    """
    def getJSON(self):
        callback = hasattr(self.request, 'callback') and 'json' + self.request['callback'] or None
        only_documented = not hasattr(self.request, 'only_documented') 
        
        state = getMultiAdapter(
                (self.context, self.request),
                name=u'plone_context_state')

        # Check view type
        view_type = state.view_template_id()

        if view_type == "double_view":
            options = {
                'changes': True,
                'slidesToShow': 2,
                'arrows':False,
                'height':'480px',
                'type': 'double'
            }
        elif view_type == "multiple_view":
            options = {
                'changes': True,
                'autoplay': True,
                'autoplaySpeed': 500,
                'type': 'multiple',
                'arrows': False
            }
        else:
            options = {
                'changes': False
            }

        json_str = json.dumps(options)

        if callback is not None:
            return callback +'(' + json_str + ')'
        else:
            return json_str


class get_fields(BrowserView):
    """
    Utils
    """

    def get_object_body(self, object):
        if hasattr(object, 'text') and object.text != None:
            return object.text.output
        else:
            return ""

    def trim_white_spaces(self, text):
        if text != "" and text != None:
            if len(text) > 0:
                if text[0] == " ":
                    text = text[1:]
                if len(text) > 0:
                    if text[-1] == " ":
                        text = text[:-1]
                return text
            else:
                return ""
        else:
            return ""

    def create_author_name(self, value):
        comma_split = value.split(",")

        for i in range(len(comma_split)):       
            name_split = comma_split[i].split('(')
            
            raw_name = name_split[0]
            name_split[0] = self.trim_white_spaces(raw_name)
            name_artist = name_split[0]
            
            name_artist_link = '<a href="/'+self.context.language+'/search?SearchableText=%s">%s</a>' % (name_artist, name_artist)
            name_split[0] = name_artist_link

            if len(name_split) > 1:
                if len(name_split[1]) > 0:
                    name_split[0] = name_artist_link + " "
        
            comma_split[i] = '('.join(name_split)

        _value = ", ".join(comma_split)

        return _value

    def create_materials(self, value):
        materials = value.split(',')
        _value = ""
        for i, mat in enumerate(materials):
            if i == (len(materials)-1):
                _value += '<a href="/'+self.context.language+'/search?SearchableText=%s">%s</a>' % (mat, mat)
            else:
                _value += '<a href="/'+self.context.language+'/search?SearchableText=%s">%s</a>, ' % (mat, mat)

        return _value

    def get_all_fields_object(self, object):
        object_schema = []
        schema = getUtility(IDexterityFTI, name='Object').lookupSchema()

        if object.portal_type in ["Object"]:
            for name, field in getFieldsInOrder(schema):
                if name not in ["text"] and name in ['title', 'identification_objectName_objectName', 'identification_objectName_objectCategory',
                                                        'identification_identification_collection',
                                                        'productionDating_dating_period', 'physicalCharacteristics_materials', 'physicalCharacteristics_dimensions',
                                                        'identification_identification_objectNumber']:
                    value = getattr(object, name, '')
                    if value != None and value != '':
                        if name in ['technique', 'artist', 'material', 'object_type', 'object_category', 'publisher', 'author', 'identification_identification_objectNumber']:
                            if (name == 'artist') or (name == 'author'):
                                _value = self.create_author_name(value)
                                value = _value
                            elif (name == 'material') or (name == 'technique'):
                                _value = self.create_materials(value)
                                value = _value
                            else:
                                _value = '<a href="/'+self.context.language+'/search?SearchableText=%s">%s</a>' % (value, value)
                                value = _value

                        _title = MessageFactory(field.title)
                        new_attr = {"title": self.context.translate(_title), "value": value, "name": name}
                        
                        if type(new_attr['value']) != list:
                            if name in ['artist', 'author']:
                                object_schema.insert(0, new_attr)
                            else:
                                object_schema.append(new_attr)
                        else:
                            if name in ['productionDating_dating_period']:
                                new_val = []

                                for val in new_attr['value']:
                                    if val['date_early'] != val['date_late']:
                                        if val['date_early_precision'] != None and val['date_early_precision'] != "":
                                            new_val.append("%s %s - %s" % (val['date_early_precision'], val['date_early'], val['date_late']))
                                        else:
                                            new_val.append("%s - %s" % (val['date_early'], val['date_late']))
                                    else:
                                        if val['date_early_precision'] != None and val['date_early_precision'] != "":
                                            new_val.append("%s %s" % (val['date_early_precision'], val['date_early']))
                                        else:
                                            new_val.append("%s" % (val['date_early']))

                                new_val_str = '<p>'.join(new_val)
                                if len(new_val) > 0:
                                    if new_val_str != "":
                                        new_attr['value'] = new_val_str
                                object_schema.append(new_attr)

                            elif name in ['physicalCharacteristics_dimensions']:
                                new_val = []
                                for val in new_attr['value']:
                                    new_val.append("%s: %s %s" % (val['dimension'], val['value'], val['unit']))

                                new_val_str = '<p>'.join(new_val)
                                if len(new_val) > 0:
                                    if new_val_str != "":
                                        new_attr['value'] = new_val_str
                                    
                                object_schema.append(new_attr)
                            else:
                                new_val = []
                                for val in new_attr['value']:
                                    dict_val = []
                                    for key in val:
                                        if val[key] != "" and val[key] != None:
                                            dict_val.append("<a href='/%s/%s%s'>%s</a>" %(str(self.context.language),"search?SearchableText=",val[key],val[key]))
                                    
                                    dict_val_str = ", ".join(dict_val)
                                    new_val.append(dict_val_str)

                                if name in ['physicalCharacteristics_materials']:
                                    new_val_str = ', '.join(new_val)
                                else:
                                    new_val_str = '<p>'.join(new_val)
                                if len(new_val) > 0:
                                    if new_val_str != "":
                                        new_attr['value'] = new_val_str
                                else:
                                    new_attr['value'] = ""
                                object_schema.append(new_attr)

            
            object_title = getattr(object, 'title', '')
            new_attr = {'title': self.context.translate('Title'), "value": object_title}

            if len(object_schema) > 1 and object_schema[0]['name'] == "author":
                if object_schema[1]['name'] == "illustrator":
                    if object.book_title != '':
                        new_attr = {'title': self.context.translate('Title'), "value": object.book_title}
                        object_schema.insert(2, new_attr)
                else:
                    if object.book_title != '':
                        new_attr = {'title': self.context.translate('Title'), "value": object.book_title}
                        object_schema.insert(1, new_attr)

            if len(object_schema) > 1 and object_schema[0]['name'] == "artist":
                object_schema.insert(1, new_attr)
            elif len(object_schema) > 1 and object_schema[0]['name'] != "artist" and object_schema[0]['name'] != "author":
                object_schema.insert(0, new_attr)

            obj_body = self.get_object_body(object)
            object_schema.append({"title": "body", "value":obj_body})
        else:
            object_schema = []

        return object_schema

    def getJSON(self):
        schema = []
        if self.context.portal_type == "Object":
            obj = self.context
            schema = self.get_all_fields_object(obj)

        return json.dumps({'schema':schema})


class CollectionSlideshow(BrowserView):
    def getImageObject(self, item):
        if item.portal_type == "Image":
            return item.getObject()
        if item.hasMedia and item.leadMedia != None:
            catalog = getToolByName(self.context, 'portal_catalog')
            media_brains = catalog.queryCatalog({"UID": item.leadMedia})
            media = media_brains[0]
            media_object = media.getObject()
            return "%s%s" %(media_object.absolute_url(), "/@@images/image/large")

        return ""

    def get_collection_items(self):
        collection_items = []
        if self.context.portal_type == "Collection":
            collection_obj = self.context
            brains = collection_obj.queryCatalog(batch=False)
            results = list(brains)
            
            for item in results[1:]:
                if item.portal_type == "Link" and item.hasMedia:
                    image = self.getImageObject(item)
                    obj_id = obj.getId()
                    obj = item.getObject()
                    data_description = obj.Description()
                    data_title = obj.Title()
                    data_url = obj.absolute_url()

                    collection_items.append({
                        "_id": obj_id,
                        "is_video": True,
                        "remote_url": obj.remoteUrl,
                        "has_overlay": True,
                        "data_description": data_description,
                        "data_title": data_title,
                        "data_url": data_url,
                        "image_path": image
                    });

                elif item.portal_type == "Link" and not item.hasMedia:
                    obj = item.getObject()
                    obj_id = obj.getId()
                    data_description = obj.Description()
                    data_title = obj.Title()
                    data_url = obj.absolute_url()
                    collection_items.append({
                        "_id": obj_id,
                        "is_video": True,
                        "remote_url": obj.remoteUrl,
                        "has_overlay": False,
                        "data_description": data_description,
                        "data_title": data_title,
                        "data_url": data_url,
                        "image_path": ""
                    });

                elif item.portal_type == "Object" or item.portal_type == "Event":
                    obj = item.getObject()
                    obj_id = obj.getId()
                    data_description = obj.Description()
                    data_title = obj.Title()
                    data_url = obj.absolute_url()
                    image = self.getImageObject(item)

                    collection_items.append({
                        "_id": obj_id,
                        "is_video": False,
                        "remote_url": "",
                        "has_overlay": False,
                        "data_description": data_description,
                        "data_title": data_title,
                        "data_url": data_url,
                        "image_path": image
                    });

        return json.dumps(collection_items)


