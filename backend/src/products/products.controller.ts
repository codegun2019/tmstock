/**
 * Products Controller
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'List products with filters' })
  findAll(
    @Query('active') active?: string,
    @Query('search') search?: string,
    @Query('category_id') categoryId?: string,
    @Query('limit') limit?: string,
  ) {
    const activeOnly = active === 'true';
    const categoryIdNum = categoryId ? parseInt(categoryId, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.productsService.findAll(activeOnly, search, categoryIdNum, limitNum);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Find product by barcode' })
  findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'Get product stock by branch (UX Integration)' })
  async getProductStock(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getStockByBranch(id);
  }

  @Get(':id/movements')
  @ApiOperation({ summary: 'Get product stock movements (UX Integration)' })
  async getProductMovements(
    @Param('id', ParseIntPipe) id: number,
    @Query('branch_id') branchId?: string,
    @Query('limit') limit?: string,
  ) {
    const branchIdNum = branchId ? parseInt(branchId, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.productsService.getStockMovements(id, branchIdNum, limitNum);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate product' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate product' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.activate(id);
  }
}

