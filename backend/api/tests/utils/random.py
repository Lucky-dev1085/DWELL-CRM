import random
import functools


def chance(max_of, to_get=1):
    probability = to_get / max_of
    return random.choices((0, 1), (1 - probability, probability))[0]


def chance_with_max(max_count):
    return functools.partial(chance, max_count)


def list_chances(max_of, to_get=1):
    result = [0] * (max_of - to_get) + [1] * to_get
    random.shuffle(result)
    return result


def list_chances_with_max(max_count):
    return functools.partial(list_chances, max_count)


bool_chance = chance_with_max(2)
bool_chance_list = list_chances_with_max(2)
