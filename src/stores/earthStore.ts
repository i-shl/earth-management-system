import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ==================== 基础数据类型 ====================

export interface Continent {
  id: string
  name: string
  area: number
  population: number
  countries: Country[]
  climate: string
  avgTemp: number
}

export interface Country {
  id: string
  name: string
  population: number
  area: number
  capital: string
  gdp: number
  continentId: string
  flag: string
  languages: string[]
  currency: string
  government: string
  happinessIndex: number
  lifeExpectancy: number
}

export interface Ocean {
  id: string
  name: string
  area: number
  maxDepth: number
  avgDepth: number
  volume: number
  temperature: number
  salinity: number
  pollutionLevel: number
}

export interface Human {
  id: string
  name: string
  country: string
  countryId: string
  age: number
  occupation: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'suspended'
  health: number
  education: string
  income: number
}

export interface Species {
  id: string
  name: string
  type: 'mammal' | 'bird' | 'reptile' | 'amphibian' | 'fish' | 'insect' | 'plant'
  status: 'extinct' | 'critical' | 'endangered' | 'vulnerable' | 'safe'
  population: number
  trend: 'increasing' | 'decreasing' | 'stable'
  habitat: string
  lastSighting: string
}

export interface Satellite {
  id: string
  name: string
  owner: string
  type: 'communication' | 'navigation' | 'weather' | 'scientific' | 'military'
  orbit: 'LEO' | 'MEO' | 'GEO'
  status: 'active' | 'decommissioned' | 'malfunction'
  launchDate: string
  lastSignal: string
}

export interface Weather {
  id: string
  location: string
  temperature: number
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: string
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy'
  visibility: number
  uvIndex: number
  airQuality: number
}

export interface Resource {
  id: string
  name: string
  type: 'energy' | 'mineral' | 'water' | 'forest' | 'food'
  totalReserve: number
  annualProduction: number
  annualConsumption: number
  unit: string
  region: string
  sustainability: number
}

export interface Environment {
  id: string
  region: string
  airQuality: number
  waterQuality: number
  soilQuality: number
  biodiversity: number
  forestCoverage: number
  carbonEmissions: number
  renewableEnergy: number
  wasteRecycling: number
  ozoneLevel: number // DU
  co2Level: number // ppm
}

export interface Event {
  id: string
  title: string
  type: 'natural' | 'political' | 'economic' | 'social' | 'environmental'
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: string
  description: string
  timestamp: string
  status: 'ongoing' | 'resolved' | 'pending'
  affectedPopulation: number
}

export interface SystemLog {
  id: string
  action: string
  user: string
  timestamp: string
  details: string
  type: 'info' | 'warning' | 'error' | 'success'
}

// ==================== Store 定义 ====================

export const useEarthStore = defineStore('earth', () => {
  // ==================== 状态数据 ====================
  
  const continents = ref<Continent[]>([
    {
      id: 'asia',
      name: '亚洲',
      area: 44579000,
      population: 4640568482,
      climate: '温带/热带季风',
      avgTemp: 15.5,
      countries: [
        { id: 'cn', name: '中国', population: 1439323776, area: 9596961, capital: '北京', gdp: 177340.63, continentId: 'asia', flag: '🇨🇳', languages: ['中文'], currency: '人民币', government: '社会主义', happinessIndex: 5.8, lifeExpectancy: 77.3 },
        { id: 'jp', name: '日本', population: 126476461, area: 377975, capital: '东京', gdp: 49408.34, continentId: 'asia', flag: '🇯🇵', languages: ['日语'], currency: '日元', government: '议会制君主立宪制', happinessIndex: 5.9, lifeExpectancy: 84.6 },
        { id: 'in', name: '印度', population: 1380004385, area: 3287263, capital: '新德里', gdp: 31469.25, continentId: 'asia', flag: '🇮🇳', languages: ['印地语', '英语'], currency: '卢比', government: '联邦议会共和制', happinessIndex: 3.8, lifeExpectancy: 69.7 },
        { id: 'kr', name: '韩国', population: 51269185, area: 100210, capital: '首尔', gdp: 18346.21, continentId: 'asia', flag: '🇰🇷', languages: ['韩语'], currency: '韩元', government: '总统制共和制', happinessIndex: 5.9, lifeExpectancy: 83.3 },
        { id: 'id', name: '印度尼西亚', population: 273523615, area: 1904569, capital: '雅加达', gdp: 11862.55, continentId: 'asia', flag: '🇮🇩', languages: ['印尼语'], currency: '印尼盾', government: '总统制共和制', happinessIndex: 5.3, lifeExpectancy: 71.7 }
      ]
    },
    {
      id: 'europe',
      name: '欧洲',
      area: 10160000,
      population: 747636026,
      climate: '温带海洋性',
      avgTemp: 9.8,
      countries: [
        { id: 'de', name: '德国', population: 83783942, area: 357022, capital: '柏林', gdp: 42598.35, continentId: 'europe', flag: '🇩🇪', languages: ['德语'], currency: '欧元', government: '联邦议会共和制', happinessIndex: 7.3, lifeExpectancy: 81.3 },
        { id: 'fr', name: '法国', population: 65273511, area: 643801, capital: '巴黎', gdp: 29368.49, continentId: 'europe', flag: '🇫🇷', languages: ['法语'], currency: '欧元', government: '半总统制共和制', happinessIndex: 6.7, lifeExpectancy: 82.7 },
        { id: 'uk', name: '英国', population: 67886011, area: 242495, capital: '伦敦', gdp: 31588.78, continentId: 'europe', flag: '🇬🇧', languages: ['英语'], currency: '英镑', government: '议会制君主立宪制', happinessIndex: 7.0, lifeExpectancy: 81.3 },
        { id: 'it', name: '意大利', population: 60461826, area: 301340, capital: '罗马', gdp: 21745.39, continentId: 'europe', flag: '🇮🇹', languages: ['意大利语'], currency: '欧元', government: '议会制共和制', happinessIndex: 6.4, lifeExpectancy: 83.5 }
      ]
    },
    {
      id: 'africa',
      name: '非洲',
      area: 30370000,
      population: 1340598147,
      climate: '热带/亚热带',
      avgTemp: 24.3,
      countries: [
        { id: 'ng', name: '尼日利亚', population: 206139589, area: 923768, capital: '阿布贾', gdp: 4329.86, continentId: 'africa', flag: '🇳🇬', languages: ['英语'], currency: '奈拉', government: '联邦总统制', happinessIndex: 4.7, lifeExpectancy: 54.7 },
        { id: 'eg', name: '埃及', population: 102334404, area: 1001450, capital: '开罗', gdp: 3691.28, continentId: 'africa', flag: '🇪🇬', languages: ['阿拉伯语'], currency: '埃及镑', government: '半总统制共和制', happinessIndex: 4.2, lifeExpectancy: 72.0 },
        { id: 'za', name: '南非', population: 59308690, area: 1219090, capital: '比勒陀利亚', gdp: 4019.87, continentId: 'africa', flag: '🇿🇦', languages: ['英语', '祖鲁语'], currency: '兰特', government: '议会制共和制', happinessIndex: 4.8, lifeExpectancy: 64.1 }
      ]
    },
    {
      id: 'north_america',
      name: '北美洲',
      area: 24709000,
      population: 579024000,
      climate: '温带/亚热带',
      avgTemp: 12.7,
      countries: [
        { id: 'us', name: '美国', population: 331002651, area: 9833517, capital: '华盛顿', gdp: 259500.63, continentId: 'north_america', flag: '🇺🇸', languages: ['英语'], currency: '美元', government: '联邦总统制', happinessIndex: 6.9, lifeExpectancy: 78.9 },
        { id: 'ca', name: '加拿大', population: 37742154, area: 9984670, capital: '渥太华', gdp: 19364.03, continentId: 'north_america', flag: '🇨🇦', languages: ['英语', '法语'], currency: '加元', government: '议会制君主立宪制', happinessIndex: 7.2, lifeExpectancy: 82.3 },
        { id: 'mx', name: '墨西哥', population: 128932753, area: 1964375, capital: '墨西哥城', gdp: 12589.74, continentId: 'north_america', flag: '🇲🇽', languages: ['西班牙语'], currency: '比索', government: '联邦总统制', happinessIndex: 6.5, lifeExpectancy: 75.1 }
      ]
    },
    {
      id: 'south_america',
      name: '南美洲',
      area: 17840000,
      population: 430759766,
      climate: '热带雨林/温带',
      avgTemp: 21.5,
      countries: [
        { id: 'br', name: '巴西', population: 212559417, area: 8515767, capital: '巴西利亚', gdp: 18677.32, continentId: 'south_america', flag: '🇧🇷', languages: ['葡萄牙语'], currency: '雷亚尔', government: '联邦总统制', happinessIndex: 6.4, lifeExpectancy: 75.9 },
        { id: 'ar', name: '阿根廷', population: 45195774, area: 2780400, capital: '布宜诺斯艾利斯', gdp: 6377.29, continentId: 'south_america', flag: '🇦🇷', languages: ['西班牙语'], currency: '比索', government: '联邦总统制', happinessIndex: 5.9, lifeExpectancy: 76.7 }
      ]
    },
    {
      id: 'oceania',
      name: '大洋洲',
      area: 8600000,
      population: 42677813,
      climate: '热带/温带',
      avgTemp: 18.2,
      countries: [
        { id: 'au', name: '澳大利亚', population: 25499884, area: 7692024, capital: '堪培拉', gdp: 16142.39, continentId: 'oceania', flag: '🇦🇺', languages: ['英语'], currency: '澳元', government: '议会制君主立宪制', happinessIndex: 7.2, lifeExpectancy: 83.4 },
        { id: 'nz', name: '新西兰', population: 4822233, area: 268838, capital: '惠灵顿', gdp: 2497.45, continentId: 'oceania', flag: '🇳🇿', languages: ['英语', '毛利语'], currency: '新西兰元', government: '议会制君主立宪制', happinessIndex: 7.3, lifeExpectancy: 82.3 }
      ]
    }
  ])

  const oceans = ref<Ocean[]>([
    { id: 'pacific', name: '太平洋', area: 181300000, maxDepth: 11034, avgDepth: 4280, volume: 710000000, temperature: 3.5, salinity: 34.6, pollutionLevel: 15 },
    { id: 'atlantic', name: '大西洋', area: 94300000, maxDepth: 8486, avgDepth: 3646, volume: 310000000, temperature: 4.0, salinity: 35.0, pollutionLevel: 22 },
    { id: 'indian', name: '印度洋', area: 73556000, maxDepth: 7258, avgDepth: 3741, volume: 292131000, temperature: 17.0, salinity: 34.8, pollutionLevel: 18 },
    { id: 'southern', name: '南冰洋', area: 21960000, maxDepth: 7236, avgDepth: 3270, volume: 71800000, temperature: -1.8, salinity: 34.7, pollutionLevel: 8 },
    { id: 'arctic', name: '北冰洋', area: 15558000, maxDepth: 5450, avgDepth: 1205, volume: 18750000, temperature: -1.5, salinity: 32.5, pollutionLevel: 12 }
  ])

  const humans = ref<Human[]>([
    { id: 'h001', name: '张伟', country: '中国', countryId: 'cn', age: 28, occupation: '软件工程师', email: 'zhangwei@example.cn', phone: '+86-138-0000-0001', status: 'active', health: 95, education: '硕士', income: 250000 },
    { id: 'h002', name: 'John Smith', country: '美国', countryId: 'us', age: 35, occupation: '医生', email: 'john.smith@example.com', phone: '+1-555-0001', status: 'active', health: 88, education: '博士', income: 450000 },
    { id: 'h003', name: 'Maria Garcia', country: '墨西哥', countryId: 'mx', age: 42, occupation: '教师', email: 'maria.garcia@example.mx', phone: '+52-555-0001', status: 'active', health: 92, education: '本科', income: 180000 },
    { id: 'h004', name: 'Yuki Tanaka', country: '日本', countryId: 'jp', age: 31, occupation: '设计师', email: 'yuki.tanaka@example.jp', phone: '+81-3-0000-0001', status: 'active', health: 90, education: '硕士', income: 320000 },
    { id: 'h005', name: 'Hans Mueller', country: '德国', countryId: 'de', age: 45, occupation: '工程师', email: 'hans.mueller@example.de', phone: '+49-30-0000-0001', status: 'inactive', health: 78, education: '硕士', income: 380000 },
    { id: 'h006', name: 'Priya Sharma', country: '印度', countryId: 'in', age: 26, occupation: '数据分析师', email: 'priya.sharma@example.in', phone: '+91-11-0000-0001', status: 'active', health: 94, education: '硕士', income: 150000 },
    { id: 'h007', name: 'Ahmed Hassan', country: '埃及', countryId: 'eg', age: 38, occupation: '建筑师', email: 'ahmed.hassan@example.eg', phone: '+20-2-0000-0001', status: 'active', health: 85, education: '本科', income: 120000 },
    { id: 'h008', name: 'Sophie Martin', country: '法国', countryId: 'fr', age: 29, occupation: '记者', email: 'sophie.martin@example.fr', phone: '+33-1-0000-0001', status: 'active', health: 91, education: '硕士', income: 280000 },
    { id: 'h009', name: 'Lucas Silva', country: '巴西', countryId: 'br', age: 33, occupation: '律师', email: 'lucas.silva@example.br', phone: '+55-11-0000-0001', status: 'suspended', health: 82, education: '博士', income: 350000 },
    { id: 'h010', name: 'Emma Wilson', country: '澳大利亚', countryId: 'au', age: 27, occupation: '科学家', email: 'emma.wilson@example.au', phone: '+61-2-0000-0001', status: 'active', health: 96, education: '博士', income: 420000 }
  ])

  const species = ref<Species[]>([
    { id: 's001', name: '大熊猫', type: 'mammal', status: 'safe', population: 1864, trend: 'increasing', habitat: '中国四川', lastSighting: '2024-03-01' },
    { id: 's002', name: '蓝鲸', type: 'mammal', status: 'endangered', population: 15000, trend: 'stable', habitat: '全球海洋', lastSighting: '2024-02-15' },
    { id: 's003', name: '华南虎', type: 'mammal', status: 'extinct', population: 0, trend: 'stable', habitat: '中国南方', lastSighting: '1970-01-01' },
    { id: 's004', name: '非洲象', type: 'mammal', status: 'endangered', population: 415000, trend: 'decreasing', habitat: '非洲撒哈拉以南', lastSighting: '2024-02-28' },
    { id: 's005', name: '北极熊', type: 'mammal', status: 'vulnerable', population: 26000, trend: 'decreasing', habitat: '北极圈', lastSighting: '2024-03-02' },
    { id: 's006', name: '金刚鹦鹉', type: 'bird', status: 'endangered', population: 5000, trend: 'decreasing', habitat: '南美雨林', lastSighting: '2024-02-20' },
    { id: 's007', name: '海龟', type: 'reptile', status: 'vulnerable', population: 85000, trend: 'stable', habitat: '热带海洋', lastSighting: '2024-03-03' },
    { id: 's008', name: '帝企鹅', type: 'bird', status: 'safe', population: 595000, trend: 'stable', habitat: '南极洲', lastSighting: '2024-02-25' },
    { id: 's009', name: '孟加拉虎', type: 'mammal', status: 'endangered', population: 2500, trend: 'increasing', habitat: '印度、孟加拉', lastSighting: '2024-02-18' },
    { id: 's010', name: '大白鲨', type: 'fish', status: 'vulnerable', population: 3500, trend: 'decreasing', habitat: '全球温带海域', lastSighting: '2024-03-01' },
    { id: 's011', name: '红树林', type: 'plant', status: 'vulnerable', population: 152000, trend: 'decreasing', habitat: '热带海岸', lastSighting: '2024-03-04' },
    { id: 's012', name: '珊瑚礁', type: 'plant', status: 'critical', population: 284300, trend: 'decreasing', habitat: '热带浅海', lastSighting: '2024-03-04' }
  ])

  const satellites = ref<Satellite[]>([
    { id: 'sat001', name: 'Starlink-V2-1', owner: 'SpaceX', type: 'communication', orbit: 'LEO', status: 'active', launchDate: '2023-12-01', lastSignal: '2024-03-04T12:00:00Z' },
    { id: 'sat002', name: 'GPS-III-06', owner: 'USA', type: 'navigation', orbit: 'MEO', status: 'active', launchDate: '2022-01-15', lastSignal: '2024-03-04T12:05:00Z' },
    { id: 'sat003', name: 'Fengyun-4B', owner: 'China', type: 'weather', orbit: 'GEO', status: 'active', launchDate: '2021-06-03', lastSignal: '2024-03-04T11:50:00Z' },
    { id: 'sat004', name: 'Hubble Space Telescope', owner: 'NASA', type: 'scientific', orbit: 'LEO', status: 'active', launchDate: '1990-04-24', lastSignal: '2024-03-04T11:55:00Z' },
    { id: 'sat005', name: 'ISS', owner: 'International', type: 'scientific', orbit: 'LEO', status: 'active', launchDate: '1998-11-20', lastSignal: '2024-03-04T12:10:00Z' },
    { id: 'sat006', name: 'Galileo-24', owner: 'EU', type: 'navigation', orbit: 'MEO', status: 'active', launchDate: '2021-12-05', lastSignal: '2024-03-04T12:03:00Z' },
    { id: 'sat007', name: 'GOES-18', owner: 'USA', type: 'weather', orbit: 'GEO', status: 'active', launchDate: '2022-03-01', lastSignal: '2024-03-04T11:58:00Z' },
    { id: 'sat008', name: 'BeiDou-3M23', owner: 'China', type: 'navigation', orbit: 'MEO', status: 'active', launchDate: '2020-06-23', lastSignal: '2024-03-04T12:07:00Z' },
    { id: 'sat009', name: 'Sentinel-2B', owner: 'ESA', type: 'scientific', orbit: 'LEO', status: 'active', launchDate: '2017-03-07', lastSignal: '2024-03-04T11:52:00Z' },
    { id: 'sat010', name: 'KH-11 Kennen', owner: 'USA', type: 'military', orbit: 'LEO', status: 'active', launchDate: '2013-08-28', lastSignal: '2024-03-04T12:01:00Z' },
    { id: 'sat011', name: 'Yaogan-35', owner: 'China', type: 'military', orbit: 'LEO', status: 'active', launchDate: '2021-11-06', lastSignal: '2024-03-04T11:59:00Z' },
    { id: 'sat012', name: 'Intelsat-40e', owner: 'Intelsat', type: 'communication', orbit: 'GEO', status: 'decommissioned', launchDate: '2019-08-06', lastSignal: '2023-12-15T08:30:00Z' }
  ])

  const weather = ref<Weather[]>([
    { id: 'w001', location: '北京, 中国', temperature: 22, humidity: 45, pressure: 1013, windSpeed: 12, windDirection: '东北', condition: 'sunny', visibility: 10, uvIndex: 6, airQuality: 45 },
    { id: 'w002', location: '上海, 中国', temperature: 18, humidity: 68, pressure: 1015, windSpeed: 15, windDirection: '东南', condition: 'cloudy', visibility: 8, uvIndex: 4, airQuality: 52 },
    { id: 'w003', location: '纽约, 美国', temperature: 15, humidity: 55, pressure: 1012, windSpeed: 18, windDirection: '西', condition: 'rainy', visibility: 6, uvIndex: 2, airQuality: 68 },
    { id: 'w004', location: '洛杉矶, 美国', temperature: 25, humidity: 40, pressure: 1014, windSpeed: 10, windDirection: '西南', condition: 'sunny', visibility: 12, uvIndex: 8, airQuality: 72 },
    { id: 'w005', location: '伦敦, 英国', temperature: 12, humidity: 75, pressure: 1010, windSpeed: 20, windDirection: '西北', condition: 'rainy', visibility: 5, uvIndex: 1, airQuality: 58 },
    { id: 'w006', location: '巴黎, 法国', temperature: 14, humidity: 62, pressure: 1011, windSpeed: 14, windDirection: '北', condition: 'cloudy', visibility: 7, uvIndex: 3, airQuality: 65 },
    { id: 'w007', location: '东京, 日本', temperature: 20, humidity: 58, pressure: 1016, windSpeed: 16, windDirection: '东', condition: 'sunny', visibility: 10, uvIndex: 5, airQuality: 48 },
    { id: 'w008', location: '悉尼, 澳大利亚', temperature: 28, humidity: 50, pressure: 1018, windSpeed: 12, windDirection: '东南', condition: 'sunny', visibility: 15, uvIndex: 9, airQuality: 82 },
    { id: 'w009', location: '莫斯科, 俄罗斯', temperature: 5, humidity: 80, pressure: 1008, windSpeed: 25, windDirection: '北', condition: 'snowy', visibility: 3, uvIndex: 1, airQuality: 42 },
    { id: 'w010', location: '开罗, 埃及', temperature: 32, humidity: 25, pressure: 1015, windSpeed: 8, windDirection: '北', condition: 'sunny', visibility: 12, uvIndex: 10, airQuality: 38 },
    { id: 'w011', location: '里约热内卢, 巴西', temperature: 30, humidity: 70, pressure: 1012, windSpeed: 14, windDirection: '东', condition: 'stormy', visibility: 4, uvIndex: 7, airQuality: 55 },
    { id: 'w012', location: '孟买, 印度', temperature: 35, humidity: 85, pressure: 1010, windSpeed: 10, windDirection: '西南', condition: 'rainy', visibility: 5, uvIndex: 6, airQuality: 32 }
  ])

  const resources = ref<Resource[]>([
    { id: 'r001', name: '石油', type: 'energy', totalReserve: 173400000000, annualProduction: 4474000000, annualConsumption: 4673000000, unit: '桶', region: '中东', sustainability: 35 },
    { id: 'r002', name: '天然气', type: 'energy', totalReserve: 188100000000000, annualProduction: 3988000000000, annualConsumption: 3927000000000, unit: '立方米', region: '俄罗斯', sustainability: 42 },
    { id: 'r003', name: '煤炭', type: 'energy', totalReserve: 1074000000000, annualProduction: 7900000000, annualConsumption: 7861000000, unit: '吨', region: '中国', sustainability: 28 },
    { id: 'r004', name: '铁矿石', type: 'mineral', totalReserve: 180000000000, annualProduction: 2500000000, annualConsumption: 2400000000, unit: '吨', region: '澳大利亚', sustainability: 55 },
    { id: 'r005', name: '铜矿', type: 'mineral', totalReserve: 870000000, annualProduction: 21000000, annualConsumption: 24000000, unit: '吨', region: '智利', sustainability: 48 },
    { id: 'r006', name: '黄金', type: 'mineral', totalReserve: 54000, annualProduction: 3300, annualConsumption: 4400, unit: '吨', region: '南非', sustainability: 38 },
    { id: 'r007', name: '淡水', type: 'water', totalReserve: 35000000000000, annualProduction: 4600000000000, annualConsumption: 4000000000000, unit: '立方米', region: '全球', sustainability: 62 },
    { id: 'r008', name: '森林', type: 'forest', totalReserve: 4060000000, annualProduction: 0, annualConsumption: 10000000, unit: '公顷', region: '亚马逊', sustainability: 45 },
    { id: 'r009', name: '粮食', type: 'food', totalReserve: 2800000000, annualProduction: 2800000000, annualConsumption: 2700000000, unit: '吨', region: '全球', sustainability: 68 },
    { id: 'r010', name: '稀土元素', type: 'mineral', totalReserve: 120000000, annualProduction: 240000, annualConsumption: 210000, unit: '吨', region: '中国', sustainability: 52 }
  ])

  const environments = ref<Environment[]>([
    { id: 'e001', region: '全球', airQuality: 75, waterQuality: 62, soilQuality: 58, biodiversity: 42, forestCoverage: 31, carbonEmissions: 36800000000, renewableEnergy: 29, wasteRecycling: 32, ozoneLevel: 300, co2Level: 418.5 }
  ])

  const events = ref<Event[]>([
    { id: 'ev001', title: '太平洋海啸预警', type: 'natural', severity: 'high', location: '太平洋沿岸', description: '海底地震引发海啸预警', timestamp: '2024-03-04T08:30:00Z', status: 'ongoing', affectedPopulation: 50000000 },
    { id: 'ev002', title: '亚马逊雨林火灾', type: 'environmental', severity: 'critical', location: '巴西亚马逊', description: '大规模森林火灾持续蔓延', timestamp: '2024-03-03T14:20:00Z', status: 'ongoing', affectedPopulation: 2000000 },
    { id: 'ev003', title: '全球气候峰会', type: 'political', severity: 'medium', location: '日内瓦', description: '联合国气候变化大会召开', timestamp: '2024-03-02T09:00:00Z', status: 'resolved', affectedPopulation: 0 },
    { id: 'ev004', title: '印度洋飓风警报', type: 'natural', severity: 'high', location: '印度洋', description: '5级飓风正在形成', timestamp: '2024-03-04T06:15:00Z', status: 'ongoing', affectedPopulation: 15000000 },
    { id: 'ev005', title: '全球股市波动', type: 'economic', severity: 'medium', location: '全球', description: '主要股市出现大幅波动', timestamp: '2024-03-01T15:30:00Z', status: 'resolved', affectedPopulation: 0 },
    { id: 'ev006', title: '北极冰川融化加速', type: 'environmental', severity: 'critical', location: '北极圈', description: '冰川融化速度超预期', timestamp: '2024-02-28T10:00:00Z', status: 'ongoing', affectedPopulation: 0 },
    { id: 'ev007', title: '非洲粮食危机', type: 'social', severity: 'high', location: '东非', description: '干旱导致粮食短缺', timestamp: '2024-02-25T12:00:00Z', status: 'ongoing', affectedPopulation: 45000000 },
    { id: 'ev008', title: '太空垃圾清理计划', type: 'environmental', severity: 'low', location: '近地轨道', description: '国际合作清理太空碎片', timestamp: '2024-03-04T11:00:00Z', status: 'pending', affectedPopulation: 0 },
    { id: 'ev009', title: '全球疫苗接种完成', type: 'social', severity: 'low', location: '全球', description: '全球疫苗接种率达到75%', timestamp: '2024-03-03T08:00:00Z', status: 'resolved', affectedPopulation: 0 },
    { id: 'ev010', title: '地中海地震', type: 'natural', severity: 'medium', location: '土耳其', description: '6.5级地震袭击地中海地区', timestamp: '2024-03-02T03:45:00Z', status: 'resolved', affectedPopulation: 8000000 }
  ])

  const systemLogs = ref<SystemLog[]>([
    { id: 'l001', action: '系统启动', user: 'system', timestamp: '2024-03-04T00:00:00Z', details: '地球管理系统正常启动', type: 'info' }
  ])

  const currentUser = ref<{ username: string; isAdmin: boolean; lastLogin: string } | null>(null)

  // ==================== 计算属性 ====================

  const criticalEvents = computed(() => events.value.filter(e => e.severity === 'critical' && e.status !== 'resolved'))
  const ongoingEvents = computed(() => events.value.filter(e => e.status === 'ongoing'))
  const totalPopulation = computed(() => continents.value.reduce((sum, continent) => sum + continent.population, 0))
  const totalLandArea = computed(() => continents.value.reduce((sum, continent) => sum + continent.area, 0))
  const allCountries = computed(() => {
    const list: Country[] = []
    continents.value.forEach(c => list.push(...c.countries))
    return list
  })
  const totalCountries = computed(() => allCountries.value.length)
  const avgHappinessIndex = computed(() => {
    const total = allCountries.value.reduce((sum, c) => sum + (c.happinessIndex || 0), 0)
    return allCountries.value.length > 0 ? (total / allCountries.value.length).toFixed(1) : '0'
  })
  const activeHumans = computed(() => humans.value.filter(h => h.status === 'active'))

  // ==================== 方法 ====================

  const addLog = (action: string, details: string, type: SystemLog['type']) => {
    const newLog: SystemLog = {
      id: `l${Date.now()}`,
      action,
      user: currentUser.value?.username || 'system',
      timestamp: new Date().toISOString(),
      details,
      type
    }
    systemLogs.value.unshift(newLog)
  }

  const login = (username: string, password: string) => {
    if (username && password) {
      currentUser.value = { username, isAdmin: true, lastLogin: new Date().toISOString() }
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      addLog('用户登录', `${username} 成功登录系统`, 'success')
      return true
    }
    return false
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentUser')
  }

  const initStore = () => {
    const saved = localStorage.getItem('currentUser')
    if (saved) currentUser.value = JSON.parse(saved)
  }

  const addContinent = (c: Partial<Continent>) => {
    const id = Date.now().toString()
    continents.value.push({
      id,
      name: c.name || '新大洲',
      area: c.area || 0,
      population: c.population || 0,
      climate: c.climate || '未知',
      avgTemp: c.avgTemp || 0,
      countries: []
    })
    addLog('创建大洲', `创建了新大洲: ${c.name}`, 'success')
  }

  const updateContinent = (id: string, data: Partial<Continent>) => {
    const index = continents.value.findIndex(c => c.id === id)
    if (index !== -1) {
      continents.value[index] = { ...continents.value[index], ...data } as Continent
      addLog('更新大洲', `更新了大洲信息: ${continents.value[index].name}`, 'info')
    }
  }

  const deleteContinent = (id: string) => {
    continents.value = continents.value.filter(c => c.id !== id)
    addLog('删除大洲', `删除了大洲 ID: ${id}`, 'warning')
  }

  const addCountry = (continentId: string, c: Partial<Country>) => {
    const continent = continents.value.find(cont => cont.id === continentId)
    if (continent) {
      const newCountry: Country = {
        id: Date.now().toString(),
        name: c.name || '新国家',
        population: c.population || 0,
        area: c.area || 0,
        capital: c.capital || '未知',
        gdp: c.gdp || 0,
        continentId,
        flag: c.flag || '🏳️',
        languages: c.languages || [],
        currency: c.currency || '未知',
        government: c.government || '未知',
        happinessIndex: c.happinessIndex || 5,
        lifeExpectancy: c.lifeExpectancy || 70
      }
      continent.countries.push(newCountry)
      addLog('创建国家', `在 ${continent.name} 创建了新国家: ${newCountry.name}`, 'success')
    }
  }

  const addEvent = (e: Partial<Event>) => {
    const newEvent: Event = {
      id: `ev${Date.now()}`,
      title: e.title || '新事件',
      type: e.type || 'social',
      severity: e.severity || 'low',
      location: e.location || '未知',
      description: e.description || '',
      timestamp: new Date().toISOString(),
      status: e.status || 'ongoing',
      affectedPopulation: e.affectedPopulation || 0
    }
    events.value.unshift(newEvent)
    addLog('发布事件', `发布了新事件: ${newEvent.title}`, 'info')
  }

  const updateEvent = (id: string, data: Partial<Event>) => {
    const index = events.value.findIndex(e => e.id === id)
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...data } as Event
      addLog('更新事件', `更新了事件状态: ${events.value[index]!.title}`, 'info')
    }
  }

  const addSpecies = (s: Partial<Species>) => {
    species.value.push({
      id: `s${Date.now()}`,
      name: s.name || '新物种',
      type: s.type || 'mammal',
      status: s.status || 'safe',
      population: s.population || 0,
      trend: s.trend || 'stable',
      habitat: s.habitat || '未知',
      lastSighting: new Date().toLocaleDateString()
    })
  }

  const addSatellite = (s: Partial<Satellite>) => {
    satellites.value.push({
      id: `sat${Date.now()}`,
      name: s.name || '新卫星',
      owner: s.owner || '未知',
      type: s.type || 'communication',
      orbit: s.orbit || 'LEO',
      status: s.status || 'active',
      launchDate: new Date().toISOString().split('T')[0]!,
      lastSignal: new Date().toISOString()
    })
  }

  const addHuman = (h: Partial<Human>) => {
    humans.value.push({
      id: `h${Date.now()}`,
      name: h.name || '未命名',
      country: h.country || '未知',
      countryId: h.countryId || '',
      age: h.age || 0,
      occupation: h.occupation || '未知',
      email: h.email || '',
      phone: h.phone || '',
      status: h.status || 'active',
      health: h.health || 100,
      education: h.education || '未知',
      income: h.income || 0
    })
  }

  const addOcean = (o: Partial<Ocean>) => {
    oceans.value.push({
      id: `ocean${Date.now()}`,
      name: o.name || '新大洋',
      area: o.area || 0,
      maxDepth: o.maxDepth || 0,
      avgDepth: o.avgDepth || 0,
      volume: o.volume || 0,
      temperature: o.temperature || 0,
      salinity: o.salinity || 0,
      pollutionLevel: o.pollutionLevel || 0
    })
  }

  const addWeather = (w: Partial<Weather>) => {
    weather.value.push({
      id: `w${Date.now()}`,
      location: w.location || '未知地点',
      temperature: w.temperature || 0,
      humidity: w.humidity || 0,
      pressure: w.pressure || 1013,
      windSpeed: w.windSpeed || 0,
      windDirection: w.windDirection || '北',
      condition: w.condition || 'sunny',
      visibility: w.visibility || 10,
      uvIndex: w.uvIndex || 0,
      airQuality: w.airQuality || 50
    })
  }

  const addResource = (r: Partial<Resource>) => {
    resources.value.push({
      id: `r${Date.now()}`,
      name: r.name || '新资源',
      type: r.type || 'energy',
      totalReserve: r.totalReserve || 0,
      annualProduction: r.annualProduction || 0,
      annualConsumption: r.annualConsumption || 0,
      unit: r.unit || '吨',
      region: r.region || '未知',
      sustainability: r.sustainability || 50
    })
    addLog('添加资源', `添加了新资源: ${r.name}`, 'success')
  }

  return {
    continents, oceans, humans, species, satellites, weather, resources, environments, events, systemLogs, currentUser,
    criticalEvents, totalPopulation, ongoingEvents, totalLandArea, allCountries, totalCountries, avgHappinessIndex, activeHumans,
    addLog, login, logout, initStore, addContinent, updateContinent, deleteContinent, addCountry, addEvent, updateEvent,
    addSpecies, addSatellite, addHuman, addOcean, addWeather, addResource
  }
})
