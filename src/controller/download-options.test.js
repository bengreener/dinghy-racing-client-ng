import DownloadOptions from './download-options';
import NameFormat from './name-format';

it('returns name format set', () => {
    const downloadOptions = new DownloadOptions(NameFormat.SURNAMEFIRSTNAME);
    expect(downloadOptions.nameFormat).toEqual(NameFormat.SURNAMEFIRSTNAME);
})