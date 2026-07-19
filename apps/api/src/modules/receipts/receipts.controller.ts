import { Body, Controller, Param, ParseUUIDPipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReceiptsService } from './receipts.service';
import { ConfirmReceiptDto } from './dto/confirm-receipt.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('receipts')
@ApiBearerAuth()
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a receipt image; returns OCR-extracted draft fields for review' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(@CurrentUser() user: AuthenticatedUser, @UploadedFile() file: Express.Multer.File) {
    return this.receiptsService.uploadAndExtract(user.id, file);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm (optionally edited) extracted values -> creates the real transaction' })
  confirm(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmReceiptDto,
  ) {
    return this.receiptsService.confirm(user.id, id, dto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Discard a scanned receipt without creating a transaction' })
  reject(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.receiptsService.reject(user.id, id);
  }
}
