import fs from 'node:fs'

import sql from 'better-sqlite3';
import slugify from 'slugify';
import xss from 'xss'

const db = sql('meals.db');

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // throw new Error('Loading meals failed');
  return db.prepare('SELECT * FROM meals').all();
}

export function getMeal(slug) {
  return db.prepare('SELECT * FROM meals WHERE slug = ?').get(slug);
}

export async function saveMeal(meal) {
  // 1. 创建 slug 唯一标识
  const slug = slugify(meal.title, { lower: true }) + '-' + Math.round(Math.random() * 1e6);
  meal.slug = slug;

  // 2. 预防 xss 攻击
  const instructions = xss(meal.instructions);
  meal.instructions = instructions;

  // 3.处理图片的二进制文件，同时保存图片数据道本地磁盘中
  const extension = meal.image.name.split('.').pop();  // meal.image存在很多数据，.name能获得名字，照片的扩展名
  const rand = Math.random() * 10;  // 随机数，用于避免出现重复的fileName
  const fileName = `${slug}-${rand}.${extension}`

  const stream = fs.createWriteStream(`public/images/${fileName}`);
  const bufferedImage = await meal.image.arrayBuffer();

  stream.write(Buffer.from(bufferedImage), (error) => {  // 更新二进制数据道新的磁盘路径
    if (error) throw new Error('Saving image failed!')
  });

  meal.image = `/images/${fileName}`;

  db.prepare(`
    INSERT INTO meals
      (title, summary, instructions, creator, creator_email, image, slug)
    VALUES(    
      @title,       
      @summary,
      @instructions,
      @creator,
      @creator_email,
      @image,
      @slug
    )
  `).run(meal);
}