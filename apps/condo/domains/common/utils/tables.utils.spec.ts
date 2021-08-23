import {
    SorterColumn,
    getFilter,
    getStringContainsFilter,
    getNumberFilter,
    getStringOptionFilter,
    getDayGteFilter,
    getDayLteFilter,
    getBooleanFilter,
    getSortersFromQuery,
    convertSortersToSortBy,
    getFiltersFromQuery,
    getPageIndexFromOffset,
} from './tables.utils'

import moment from 'moment'

function randInt (maxValue) {
    return Math.floor(Math.random() * maxValue)
}

describe('Table utils', () => {
    const field = 'field'
    const subfield = 'subfield'
    const target = 'target'
    const suffix = 'suffix'
    const search = 'search'
    const numberSearch = '12345'
    const dateSearch = new Date(Date.now()).toISOString()
    const nestedPath = [field, subfield, target]
    const descShortSort = 'col1_DESC'
    const ascShortSort = 'col2_ASC'
    describe('getFilter', () => {
        describe('generated filter', () => {
            describe('should return undefined', () => {
                it('if no dataIndex specified', () => {
                    expect(getFilter([], 'single', 'string', suffix)(search)).toBeUndefined()
                    expect(getFilter(undefined, 'single', 'string', suffix)(search)).toBeUndefined()
                })
                describe('requested single argument', () => {
                    it('but got multiple', () => {
                        expect(getFilter(target, 'single', 'string', suffix)(['1', '2'])).toBeUndefined()
                    })
                    it('and value is not specified', () => {
                        const filter = getFilter(target, 'single', 'string', suffix)
                        expect(filter(undefined)).toBeUndefined()
                        expect(filter(null)).toBeUndefined()
                        expect(filter('')).toBeUndefined()
                    })
                    describe('if value is not able to cast query string to type', () => {
                        it('number', () => {
                            expect(getFilter(target, 'single', 'number', suffix)(search)).toBeUndefined()
                        })
                        it('dateTime', () => {
                            expect(getFilter(target, 'single', 'dateTime', suffix)(search)).toBeUndefined()
                        })
                        it('boolean', () => {
                            expect(getFilter(target, 'single', 'boolean', suffix)(search)).toBeUndefined()
                        })
                    })
                })
                describe('requested multiple arguments', () => {
                    describe('and no correct values specified', () => {
                        it('for date', () => {
                            expect(getFilter(target, 'array', 'dateTime', suffix)(['a', 'b', 'c'])).toBeUndefined()
                        })
                        it('for numbers', () => {
                            expect(getFilter(target, 'array', 'number', suffix)(['a', 'b', 'c'])).toBeUndefined()
                        })
                        it('for strings', () => {
                            expect(getFilter(target, 'array', 'string', suffix)([null, ''])).toBeUndefined()
                        })
                        it('for booleans', () => {
                            expect(getFilter(target, 'array', 'boolean', suffix)(['a', 'b', 'c'])).toBeUndefined()
                        })
                    })
                })
            })
            describe('should return correct where query', () => {
                describe('if dataIndex is', () => {
                    it('string', () => {
                        const propertyName = `${target}_${suffix}`
                        const expectedResult = { [propertyName]: search }
                        const flatFilter = getFilter(target, 'single', 'string', suffix)
                        expect(flatFilter(search)).toStrictEqual(expectedResult)
                    })
                    it('array of strings', () => {
                        const propertyName = `${target}_${suffix}`
                        const expectedResult = { [field]: { [subfield]: { [propertyName]: search } } }
                        const nestedFilter = getFilter(nestedPath, 'single', 'string', suffix)
                        expect(nestedFilter(search)).toStrictEqual(expectedResult)
                    })
                })
                describe('if suffix is', () => {
                    it('specified', () => {
                        const flatFilter = getFilter(target, 'single', 'string', suffix)
                        const nestedFilter = getFilter(nestedPath, 'single', 'string', suffix)
                        const propertyName = `${target}_${suffix}`
                        const expectedFlatResult = { [propertyName]: search }
                        const expectedNestedResult = { [field]: { [subfield]: { [propertyName]: search } } }
                        expect(flatFilter(search)).toStrictEqual(expectedFlatResult)
                        expect(nestedFilter(search)).toStrictEqual(expectedNestedResult)
                    })
                    it('not specified', () => {
                        const flatFilter = getFilter(target, 'single', 'string', undefined)
                        const emptySuffixFlatFilter = getFilter(target, 'single', 'string', '')
                        const nestedFilter = getFilter(nestedPath, 'single', 'string', null)
                        const expectedFlatResult = { [target]: search }
                        const expectedNestedResult = { [field]: { [subfield]: { [target]: search } } }
                        expect(flatFilter(search)).toStrictEqual(expectedFlatResult)
                        expect(emptySuffixFlatFilter(search)).toStrictEqual(expectedFlatResult)
                        expect(nestedFilter(search)).toStrictEqual(expectedNestedResult)
                    })
                })
                describe('if requested single argument', () => {
                    it('valid string', () => {
                        const filter = getFilter(target, 'single', 'string', undefined)
                        expect(filter(search)).toStrictEqual({ [target]: search })
                    })
                    it('valid number', () => {
                        const filter = getFilter(target, 'single', 'number', undefined)
                        expect(filter(numberSearch)).toStrictEqual({ [target]: Number(numberSearch) })
                    })
                    it('valid date', () => {
                        const filter = getFilter(target, 'single', 'dateTime', undefined)
                        expect(filter(dateSearch)).toStrictEqual({ [target]: dateSearch })
                    })
                    it('valid boolean', () => {
                        const filter = getFilter(target, 'single', 'boolean', undefined)
                        expect(filter('true')).toStrictEqual({ [target]: true })
                        expect(filter('false')).toStrictEqual({ [target]: false })
                        expect(filter('tRuE')).toStrictEqual({ [target]: true })
                        expect(filter('fALSe')).toStrictEqual({ [target]: false })
                    })
                })
                describe('if requested multiple arguments', () => {
                    it('strings', () => {
                        const filter = getFilter(target, 'array', 'string', suffix)
                        const expectedResult = { [`${target}_${suffix}`]: [search, numberSearch] }
                        expect(filter([search, numberSearch])).toStrictEqual(expectedResult)
                    })
                    it('numbers', () => {
                        const filter = getFilter(target, 'array', 'number', suffix)
                        const additionalNumber = '123'
                        const expectedResult = {
                            [`${target}_${suffix}`]: [
                                Number(numberSearch),
                                Number(additionalNumber),
                            ],
                        }
                        expect(filter([numberSearch, additionalNumber])).toStrictEqual(expectedResult)
                    })
                    it('dateTimes', () => {
                        const filter = getFilter(target, 'array', 'dateTime', suffix)
                        const additionalDate = new Date(Date.now()).toISOString()
                        const expectedResult = {
                            [`${target}_${suffix}`]: [
                                dateSearch,
                                additionalDate,
                            ],
                        }
                        expect(filter([dateSearch, additionalDate])).toStrictEqual(expectedResult)
                    })
                    it('booleans', () => {
                        const filter = getFilter(target, 'array', 'boolean', suffix)
                        const expectedResult = {
                            [`${target}_${suffix}`]: [
                                true,
                                false,
                            ],
                        }
                        expect(filter(['tRUE', 'fAlSe'])).toStrictEqual(expectedResult)
                    })
                })
            })
            it('should drop incorrect values from list of arguments', () => {
                const filter = getFilter(target, 'array', 'number', suffix)
                const expectedResult = {
                    [`${target}_${suffix}`]: [Number(numberSearch)],
                }
                expect(filter([numberSearch, search])).toStrictEqual(expectedResult)
            })
            it('should convert single argument to list if multiple requested', () => {
                const filter = getFilter(target, 'array', 'string', suffix)
                const expectedResult = { [`${target}_${suffix}`]: [search] }
                expect(filter(search)).toStrictEqual(expectedResult)
            })
        })
    })
    describe('getStringContainsFilter', () => {
        const filter = getStringContainsFilter(field)
        it('should have "contains_i" suffix', () => {
            const result = filter(search)
            expect(result).toHaveProperty(`${field}_contains_i`, search)
        })
        it('should accept only single argument', () => {
            const result = filter([search, numberSearch])
            expect(result).toBeUndefined()
        })
    })
    describe('getStringOptionFilter', () => {
        const filter = getStringOptionFilter(field)
        it('should have "in" suffix', () => {
            const result = filter(search)
            expect(result).toHaveProperty(`${field}_in`, [search])
        })
        it('should work with multiple parameters', () => {
            const result = filter([search, numberSearch])
            expect(result).toHaveProperty(`${field}_in`, [search, numberSearch])
        })
    })
    describe('getNumberFilter', () => {
        const filter = getNumberFilter(field)
        it('should have no suffix', () => {
            const result = filter(numberSearch)
            expect(result).toHaveProperty(field, Number(numberSearch))
        })
        it('should be undefined if value is not number', () => {
            const result = filter(search)
            expect(result).toBeUndefined()
        })
        it('should accept only single argument', () => {
            const result = filter([search, numberSearch])
            expect(result).toBeUndefined()
        })
    })
    describe('getDayGteFilter', () => {
        const filter = getDayGteFilter(field)
        const propertyName = `${field}_gte`
        it('should have "gte" suffix', () => {
            expect(filter(dateSearch)).toHaveProperty(propertyName)
        })
        it('should accept only single argument', () => {
            const result = filter([dateSearch, numberSearch])
            expect(result).toBeUndefined()
        })
        it('should be undefined if value is not valid date', () => {
            const result = filter(search)
            expect(result).toBeUndefined()
        })
        it('should parse start of the day correctly', () => {
            const startOfDay = moment(dateSearch).startOf('day').toISOString()
            const expectedResult = { [propertyName]: startOfDay }
            expect(filter(dateSearch)).toStrictEqual(expectedResult)
        })
    })
    describe('getDayLteFilter', () => {
        const filter = getDayLteFilter(field)
        const propertyName = `${field}_lte`
        it('should have "lte" suffix', () => {
            expect(filter(dateSearch)).toHaveProperty(propertyName)
        })
        it('should accept only single argument', () => {
            const result = filter([dateSearch, numberSearch])
            expect(result).toBeUndefined()
        })
        it('should be undefined if value is not valid date', () => {
            const result = filter(search)
            expect(result).toBeUndefined()
        })
        it('should parse end of the day correctly', () => {
            const startOfDay = moment(dateSearch).endOf('day').toISOString()
            const expectedResult = { [propertyName]: startOfDay }
            expect(filter(dateSearch)).toStrictEqual(expectedResult)
        })
    })
    describe('getBooleanFilter', () => {
        const filter = getBooleanFilter(field)
        it('should have no suffix', () => {
            const result = filter('true')
            expect(result).toHaveProperty(field, true)
        })
        it('should be undefined if value is not a boolean string', () => {
            const result = filter(search)
            expect(result).toBeUndefined()
        })
        it('should accept only single argument', () => {
            const result = filter(['true', 'false'])
            expect(result).toBeUndefined()
        })
    })
    describe('getSortersFromQuery', () => {
        describe('should return empty list', () => {
            it('if "sort" attribute is not specified', () => {
                expect(getSortersFromQuery({})).toStrictEqual([])
            })
        })
        describe('should return list of sorters', () => {
            const expectedMultipleResult = [
                { columnKey: 'col2', order: 'ascend' },
                { columnKey: 'col1', order: 'descend' },
            ]
            it('if "sort" passed as list of strings', () => {
                expect(getSortersFromQuery({ sort: [ascShortSort, descShortSort] })).toStrictEqual(expectedMultipleResult)
            })
            it('if "sort" passed as single string', () => {
                expect(getSortersFromQuery({ sort: `${ascShortSort},${descShortSort}` })).toStrictEqual(expectedMultipleResult)
            })
        })
        describe('should drop invalid columns and orders', () => {
            const expected = { columnKey: 'col1', order: 'descend' }
            it('if it\'s not possible to split it by "_"', () => {
                const sort = [descShortSort, 'col1ASD']
                expect(getSortersFromQuery({ sort })).toStrictEqual([expected])
            })
            it('if no column or correct order specified', () => {
                const brokenOrderSort = [descShortSort, 'col1_bla']
                const noColumnSort = [descShortSort, '_bla']
                expect(getSortersFromQuery({ sort: brokenOrderSort })).toStrictEqual([expected])
                expect(getSortersFromQuery({ sort: noColumnSort })).toStrictEqual([expected])
            })
        })
    })
    describe('convertSortersToSortBy', () => {
        it('should return empty list if no sorters provided', () => {
            expect(convertSortersToSortBy()).toStrictEqual([])
        })
        it('should return sortBy strings', () => {
            const sorters: Array<SorterColumn> = [
                { columnKey: 'col2', order: 'ascend' },
                { columnKey: 'col1', order: 'descend' },
            ]
            const expectedResult = [
                ascShortSort,
                descShortSort,
            ]
            expect(convertSortersToSortBy(sorters)).toStrictEqual(expectedResult)
        })
    })
    describe('getFiltersFromQuery', () => {
        describe('it should extract filters from query', () => {
            it('if valid JSON is provided', () => {
                expect(getFiltersFromQuery({ filters: '{"key": "value", "key2": "value"}' })).toStrictEqual({
                    key: 'value',
                    key2: 'value',
                })
            })
            it('if some arguments are invalid strings', () => {
                expect(getFiltersFromQuery({ filters: '{"key": true, "key2": ["value", 2]}' })).toStrictEqual({
                    key2: ['value'],
                })
            })
            it('if invalid JSON is provided', () => {
                expect(getFiltersFromQuery({ filters: '{"key": value, "key2": value}' })).toStrictEqual({})
            })
        })
    })
    describe('getPageIndexFromOffset', () => {
        const attemps = 10
        const pageSize = 10
        it('rounded value test', () => {
            for (let i = 0; i < attemps; i++) {
                const page = randInt(1000)
                expect(getPageIndexFromOffset(page * pageSize, pageSize)).toStrictEqual(page + 1)
            }
        })
        it('not-rounded value test', () => {
            for (let i = 0; i < attemps; i++) {
                const offset  = i * pageSize + randInt(pageSize)
                expect(getPageIndexFromOffset(offset, pageSize)).toStrictEqual(i + 1)
            }
        })
    })
})